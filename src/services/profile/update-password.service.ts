import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config/env";
import prisma from "../../config/prisma";
import { comparePassword, hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export const updatePasswordService = async (
  token: string,
  currentPassword: string,
  newPassword: string
) => {
  if (!token) throw new ApiError(401, "Authentication token is required");

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY!) as TokenPayload;
    const userId = decoded.id;

    if (!userId) throw new ApiError(400, "Invalid token payload");
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Password updated successfully" };
  } catch (error) {
    throw error;
  }
};
