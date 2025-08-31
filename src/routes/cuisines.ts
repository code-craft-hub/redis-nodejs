import { Router, Request, Response, NextFunction } from "express";
import { initializeRedisClient } from "../utils/client";
import { successResponse } from "../utils/responses";
import { cuisineKey, cuisinesKey, restaurantKeyById } from "../utils/keys";

export const cuisinesRouter: Router = Router();

cuisinesRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await initializeRedisClient();
      const cuisines = await client.sMembers(cuisinesKey);
      successResponse(res, cuisines);
      return;
    } catch (error) {
      next(error);
    }
  }
);

cuisinesRouter.get(
  "/:cuisine",
  async (req: Request, res: Response, next: NextFunction) => {
    const { cuisine } = req.params;

    try {
      const client = await initializeRedisClient();
      const restaurantIds = await client.sMembers(cuisineKey(cuisine));
      console.log(restaurantIds)
      const restaurants = await Promise.all(
        restaurantIds.map((id) => client.hGetAll(restaurantKeyById(id)))
      );
      successResponse(res, restaurants);
      return;
    } catch (error) {
      next(error);
    }
  }
);
