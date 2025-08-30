import { Router, Request, Response } from "express";

export const restaurantRouter = Router();

restaurantRouter.get("/", (req: Request, res: Response) => {
    res.send("hello world")
});
