import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventService = async (eventId: string | number) => {
  try {
    const id = typeof eventId === "string" ? parseInt(eventId, 10) : eventId;

    if (isNaN(id)) {
      throw new ApiError(400, "ID event tidak valid");
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        ticketTypes: true,
        vouchers: true,
        reviews: {
          include: {
            user: {
              select: {
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new ApiError(404, "Event tidak ditemukan");
    }

    const formattedEvent = {
      ...event,
      startDate: event.startDate.toISOString().slice(0, 16),
      endDate: event.endDate.toISOString().slice(0, 16),

      deletedAt: undefined,

      averageRating:
        event.reviews.length > 0
          ? event.reviews.reduce((sum, review) => sum + review.rating, 0) /
            event.reviews.length
          : 0,
    };

    return {
      message: "Detail event berhasil didapatkan",
      data: formattedEvent,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Error dalam getEventService:", error);
    throw new ApiError(500, "Gagal mendapatkan detail event");
  }
};
