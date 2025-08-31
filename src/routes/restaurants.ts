import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import { Restaurant, RestaurantSchema } from "../schemas/restaurant";
import { initializeRedisClient } from "../utils/client";
import { nanoid } from "nanoid";
import {
  cuisineKey,
  cuisinesKey,
  restaurantCuisinesKeyById,
  restaurantKeyById,
  reviewDetailsKeyById,
  reviewKeyById,
} from "../utils/keys";
import { errorResponse, successResponse } from "../utils/responses";
import { checkRestaurantExists } from "../middleware/checkRestaurantId";
import { Review, ReviewSchema } from "../schemas/review";

export const restaurantRouter: Router = Router();

restaurantRouter.post(
  "/",
  validate(RestaurantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as Restaurant;

    try {
      const client = await initializeRedisClient();
      const id = nanoid();
      const restaurantKey = restaurantKeyById(id);
      const hashData = { id, name: data.name, location: data.location };

      await Promise.all([
        ...data.cuisines.flatMap((cuisine) =>
          Promise.all([
            client.sAdd(cuisinesKey, cuisine),
            client.sAdd(cuisineKey(cuisine), id),
            client.sAdd(restaurantCuisinesKeyById(id), cuisine),
          ])
        ),
        client.hSet(restaurantKey, hashData),
      ]);

      successResponse(res, hashData, "Added new restaurant to redis");
      return;
    } catch (error) {
      next(error);
    }
    console.log(data);
    res.send("hello world");
    return;
  }
);

restaurantRouter.post(
  "/:restaurantId/reviews",
  checkRestaurantExists,
  validate(ReviewSchema),
  async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;
    const data = req.body as Review;
    try {
      const client = await initializeRedisClient();
      const reviewId = nanoid();
      const reviewKey = reviewKeyById(restaurantId);
      const reviewDetailsKey = reviewDetailsKeyById(reviewId);
      const reviewData = {
        id: reviewId,
        ...data,
        timestamp: Date.now(),
        restaurantId,
      };
      await Promise.all([
        client.lPush(reviewKey, reviewId),
        client.hSet(reviewDetailsKey, reviewData),
      ]);

      successResponse(res, reviewData, "Review added to redis");
      return;
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.get(
  "/:restaurantId/reviews",
  checkRestaurantExists,
  async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;

    const { page = 1, limit = 10 } = req.query;

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit) - 1;

    try {
      const client = await initializeRedisClient();
      const reviewKey = reviewKeyById(restaurantId);
      const reviewIds = await client.lRange(reviewKey, start, end);
      const reviews = await Promise.all(
        reviewIds.map((id) => client.hGetAll(reviewDetailsKeyById(id)))
      );

      successResponse(res, reviews);
      return;
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.get(
  "/:restaurantId",
  checkRestaurantExists,
  async (
    req: Request<{ restaurantId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId } = req.params;
    try {
      const client = await initializeRedisClient();
      const restaurantKey = restaurantKeyById(restaurantId);
      const [viewCount, restaurant, cuisines] = await Promise.all([
        client.hIncrBy(restaurantKey, "viewCount", 1),
        client.hGetAll(restaurantKey),
        client.sMembers(restaurantCuisinesKeyById(restaurantId)),
      ]);
      console.log(viewCount);
      successResponse(res, {...restaurant, cuisines, viewCount});
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

restaurantRouter.delete(
  "/:restaurantId/reviews/:reviewId",
  checkRestaurantExists,
  async (
    req: Request<{ restaurantId: string; reviewId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { restaurantId, reviewId } = req.params;
    try {
      const client = await initializeRedisClient();
      const reviewKey = reviewKeyById(restaurantId);
      const reviewDetailsKey = reviewDetailsKeyById(reviewId);
      const [removeResult, deleteResult] = await Promise.all([
        client.lRem(reviewKey, 0, reviewId),
        client.del(reviewDetailsKey),
      ]);

      if (removeResult === 0 && deleteResult === 0) {
        errorResponse(res, 404, "Review not found");
        return;
      }
      const reviewIds = await client.lRange(reviewKey, 0, -1);
      successResponse(res, reviewIds, "Review deleted from redis");
      return;
    } catch (error) {
      next(error);
    }
  }
);
