import { Router, Request, Response } from "express";
import { validate } from "../middleware/validate.js";
import { Restaurant, RestaurantSchema } from "../schemas/restaurant.js";

export const restaurantRouter = Router();

restaurantRouter.post(
  "/",
  validate(RestaurantSchema),
  async (req: Request, res: Response) => {
    const data = req.body as Restaurant;
    console.log(data);
    res.send("hello world");
  }
);
