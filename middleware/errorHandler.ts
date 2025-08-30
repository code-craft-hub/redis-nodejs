import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responses.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  errorResponse(res, 500, err);
}
