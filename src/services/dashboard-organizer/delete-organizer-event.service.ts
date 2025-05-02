import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const DeleteEventService = async (eventId: number, userId: number) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role !== "ORGANIZER") {
      throw new ApiError(403, "User is not an organizer");
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    if (event.userId !== userId) {
      throw new ApiError(403, "You are not authorized to delete this event");
    }

    const ongoingTransactions = await prisma.transaction.count({
      where: {
        eventId,
        status: {
          in: ["WAITING_FOR_PAYMENT", "WAITING_FOR_ADMIN_CONFIRMATION"],
        },
      },
    });

    if (ongoingTransactions > 0) {
      throw new ApiError(400, "Cannot delete event with ongoing transactions");
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });

    return {
      status: "success",
      message: "Event has been successfully deleted",
      data: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        deletedAt: updatedEvent.deletedAt,
      },
    };
  } catch (error) {
    throw error;
  }
};
