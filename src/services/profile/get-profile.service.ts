import { JWT_SECRET_KEY } from "../../config/env";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export const getProfileService = async (token: string) => {
  if (!token) throw new ApiError(401, "Authentication token is required");
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY!) as TokenPayload;
    const userId = decoded.id;
    
    if (!userId) throw new ApiError(400, "Invalid token payload");
    
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        bio: true,
        profilePicture: true,
        point: true,
        expirationDate: true,
        role: true,
        referralCode: true,
        referredBy: true,
      },
    });
    
    if (!user) throw new ApiError(404, "User not found");
    
    return user;
    
  } catch (error) {
    throw error;
  }
};