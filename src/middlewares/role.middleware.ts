import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const verifyRole = (roles: string[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.user.role;
    

    if (!userRole || !roles.includes(userRole)) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  };
};
