import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventByIdService = async (eventId: number, userId: number) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },
    include: {
      ticketTypes: true,
      vouchers: {
        where: {
          userId: userId
        }
      },
      organizer: {
        include: {
          user: {
            select: {
              fullName: true,
              profilePicture: true
            }
          }
        }
      }
    }
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Cek apakah user adalah organizer event ini
  const organizer = await prisma.organizer.findFirst({
    where: { 
      userId,
      id: event.organizerId
    },
  });

  if (!organizer) {
    throw new ApiError(403, "Only the organizer of this event can access this data");
  }

  return event;
};