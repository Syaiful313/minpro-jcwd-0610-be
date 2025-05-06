import { Role } from "@prisma/client";
import prisma from "../../config/prisma";

interface UpdateUserRoleBody {
  userIdTarget: number;
}

export const updateUserRoleService = async (
  body: UpdateUserRoleBody,
  userId: number
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user id");
    }

    if (user.role !== "ADMIN") {
      throw new Error("You are not an admin");
    }

    const { userIdTarget } = body;

    const organizer = await prisma.organizer.findFirst({
      where: { userId: userIdTarget },
    });

    if (organizer && organizer.acceptedAt) {
      throw new Error("User already accepted");
    }

    if (!organizer) {
      throw new Error("Organizer not found, User not requested");
    }

    await prisma.user.update({
      where: { id: userIdTarget },
      data: { role: Role.ORGANIZER },
    });

    await prisma.organizer.update({
      where: { userId: userIdTarget },
      data: { acceptedAt: new Date() },
    });

    return { message: "Update user role success" };
  } catch (error) {
    throw error;
  }
};
