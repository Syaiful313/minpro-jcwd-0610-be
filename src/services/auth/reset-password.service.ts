import prisma from "../../config/prisma";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

export const resetPasswordService = async (
  userId: number,
  password: string
) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { message: "Password reset successfully" };
  } catch (error) {
    throw error;
  }
};
