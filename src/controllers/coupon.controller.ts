import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";
import { getCouponsService } from "../services/coupon/get-coupons.service";

export const getCouponsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }
    
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 5,
      sortBy: req.query.sortBy as string || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc"
    };
    
    const result = await getCouponsService(token, query);
    
    res.status(200).json({
      status: "success",
      message: "Coupons retrieved successfully",
      ...result
    });
  } catch (error) {
    next(error);
  }
};