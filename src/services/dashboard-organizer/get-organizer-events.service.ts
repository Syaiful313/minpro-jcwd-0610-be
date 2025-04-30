import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface GetOrganizerEventsQueries extends PaginationQueryParams {
  search?: string;
 
}

export const getOrganizerEventsService = async (
  userId: number,
  queries: GetOrganizerEventsQueries
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ORGANIZER") {
    throw new ApiError(403, "User is not an organizer");
  }

  const { page, take, sortBy, sortOrder, search} = queries;

  const whereClause: Prisma.EventWhereInput = {
    userId,
    deletedAt: null,
  };

  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };
  }


  const events = await prisma.event.findMany({
    where: whereClause,
    skip: (page - 1) * take,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  const count = await prisma.event.count({ where: whereClause });

  // Enhance events with additional stats
  const enhancedEvents = await Promise.all(
    events.map(async (event) => {
      // Get transaction stats for this event
      const transactionStats = await prisma.transaction.groupBy({
        by: ["status"],
        where: { eventId: event.id },
        _count: true,
        _sum: {
          totalPrice: true,
        },
      });

      // Calculate available seats
      const soldSeats = await prisma.transaction.aggregate({
        where: {
          eventId: event.id,
          status: { in: ["DONE", "WAITING_FOR_ADMIN_CONFIRMATION"] },
        },
        _sum: {
          quantity: true,
        },
      });

      const availableSeats = event.totalSeat - (soldSeats._sum.quantity || 0);

      return {
        ...event,
        transactionCount: event._count.transactions,
        transactionStats,
        availableSeats,
        _count: undefined,
      };
    })
  );

  return {
    data: enhancedEvents,
    meta: { page, take, total: count },
  };
};
