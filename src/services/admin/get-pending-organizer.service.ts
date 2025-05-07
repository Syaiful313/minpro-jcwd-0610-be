import { Role } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getPendingOrganizerService = async (userId: number) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "Invalid user id");
    }

    if (user.role !== Role.ADMIN) {
      throw new ApiError(403, "You are not an admin");
    }

    const pendingOrganizers = await prisma.organizer.findMany({
      where: { acceptedAt: null },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
            bio: true,
          },
        },
      },
    });

    return pendingOrganizers;
  } catch (error) {
    throw error;
  }
};
