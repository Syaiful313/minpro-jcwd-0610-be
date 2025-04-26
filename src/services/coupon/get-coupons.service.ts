import { Prisma } from "@prisma/client";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config/env";
import prisma from "../../config/prisma";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export const getCouponsService = async (token: string, query: PaginationQueryParams) => {
  try {
    if (!token) throw new ApiError(401, "Authentication token is required");
    
    const decoded = jwt.verify(token, JWT_SECRET_KEY!) as TokenPayload;
    const userId = decoded.id;
    
    if (!userId) throw new ApiError(400, "Invalid token payload");
    
    const { page, sortBy, sortOrder, take } = query;
    
    const whereClause: Prisma.CouponWhereInput = {
      userId: userId,
    };
    
    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        code: true,
        discount: true,
        expirationDate: true,
        isUsed: true,
        createdAt: true,
      },
    });
    
    const count = await prisma.coupon.count({ where: whereClause });
    
    return {
      data: coupons,
      meta: {
        page,
        take,
        total: count,
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid or expired token");
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to retrieve coupons");
  }
};