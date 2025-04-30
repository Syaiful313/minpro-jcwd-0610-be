import prisma from "../../config/prisma";

export const getProfileService = async (userId: number) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user id");
    }

    const coupon = await prisma.coupon.findFirst({
      where: { userId },
    });

    const { password: pass, ...userWithoutPassword } = user;

    return { ...userWithoutPassword, coupon };
  } catch (error) {
    throw error;
  }
};
