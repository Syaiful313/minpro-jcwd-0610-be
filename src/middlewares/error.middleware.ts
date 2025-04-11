import { NextFunction, Request, Response } from "express";
import { AppiError } from "../utils/api-error";

export const errorMiddleware = (
  err: AppiError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).send({ status, message });
};
