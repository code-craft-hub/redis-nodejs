import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import { Restaurant, RestaurantSchema } from "../schemas/restaurant";
import { initializeRedisClient } from "../utils/client";
import { nanoid } from "nanoid";
import { restaurantKeyById } from "../utils/keys";
import { successResponse } from "../utils/responses";
import { checkRestaurantExists } from "../middleware/checkRestaurantId";

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

      const addResult = await client.hSet(restaurantKey, hashData);
      console.log(`Added ${addResult} to fields}`);
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
      const [viewCount,restaurant] = await Promise.all([
        client.hIncrBy(restaurantKey, "viewCount", 1),
        client.hGetAll(restaurantKey),
      ]);
      successResponse(res, restaurant);
      return;
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
