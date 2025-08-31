import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responses";
import { initializeRedisClient } from "../utils/client";
import { restaurantKeyById } from "../utils/keys";

export const checkRestaurantExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { restaurantId } = req.params;
  if (!restaurantId) {
    errorResponse(res, 400, "Restaurant ID not found");
    return;
  }

  const client = await initializeRedisClient();
  console.log(restaurantId, "CLIENT : ", client)
  const restaurantKey = restaurantKeyById(restaurantId);
  const restaurantExists = await client.exists(restaurantKey);

  if (!restaurantExists) {
    errorResponse(res, 404, "Restaurant not found");
    return;
  } else {
    next();
  }
};
