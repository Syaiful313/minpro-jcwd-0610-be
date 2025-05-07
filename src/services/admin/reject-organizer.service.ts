import { Role } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface UpdateUserRoleBody {
  userIdTarget: number;
}

export const rejectOrganizerService = async (
  body: UpdateUserRoleBody,
  userId: number
) => {
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

    const { userIdTarget } = body;

    const organizer = await prisma.organizer.findFirst({
      where: { userId: userIdTarget },
    });

    if (!organizer) {
      throw new ApiError(404, "Organizer not found, User not requested");
    }

    if (organizer.acceptedAt) {
      throw new ApiError(400, "User already accepted as organizer");
    }

    await prisma.organizer.delete({
      where: { userId: userIdTarget },
    });

    await prisma.notification.create({
      data: {
        userId: userIdTarget,
        type: "INFORMATION",
        message:
          "Maaf, permohonan Anda menjadi Organizer telah ditolak. Anda dapat mengajukan kembali di lain waktu.",
      },
    });

    return { message: "Organizer application rejected" };
  } catch (error) {
    throw error;
  }
};
