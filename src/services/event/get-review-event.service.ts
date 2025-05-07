import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getReviewsByEventIdService = async (eventId: number) => {
  const reviews = await prisma.review.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          fullName: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!reviews || reviews.length === 0) {
    throw new ApiError(404, "Belum ada review untuk event ini");
  }

  return reviews;
};