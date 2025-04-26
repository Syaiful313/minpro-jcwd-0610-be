import { NextFunction, Request, Response } from "express";
import { getReferralsService } from "../services/referral/get-referrals.service";
import { ApiError } from "../utils/api-error";

export const getReferralsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 4,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await getReferralsService(token, query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
