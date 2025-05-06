import { Prisma, TransactionStatus } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface GetAttendeeQuery extends PaginationQueryParams {
  search?: string;
}

export const getAttendeesByEventSlugService = async (
  eventSlug: string,
  userId: number,
  query: GetAttendeeQuery
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new ApiError(404, "Invalid user id");
    }

    if (user.role !== "ORGANIZER") {
      throw new ApiError(403, "You are not an organizer");
    }

    const organizer = await prisma.organizer.findFirst({
      where: { userId: userId },
    });

    if (!organizer) {
      throw new ApiError(404, "Organizer profile not found");
    }

    const event = await prisma.event.findFirst({
      where: { slug: eventSlug, deletedAt: null },
    });

    if (!event) {
      throw new ApiError(404, "Invalid event slug");
    }

    if (event.organizerId !== organizer.id) {
      throw new ApiError(403, "You are not authorized to view this event");
    }

    const {
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
      take = 10,
      search,
    } = query;

    const whereClause: Prisma.TransactionWhereInput = {
      event: { slug: eventSlug },
      status: TransactionStatus.DONE,
      deletedAt: null,
      ...(search && {
        OR: [{ user: { email: { contains: search, mode: "insensitive" } } }],
      }),
    };

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        status: true,
        event: { select: { name: true } },
        totalPrice: true,
        transactionsDetails: {
          select: {
            quantity: true,
            ticketType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const transformedTransactions = transactions.map((transaction) => {
      const totalQuantity = transaction.transactionsDetails.reduce(
        (sum, detail) => sum + detail.quantity,
        0
      );

      const ticketTypes = transaction.transactionsDetails.map(
        (detail) => detail.ticketType.name
      );

      return {
        id: transaction.id,
        user: transaction.user,
        status: transaction.status,
        event: transaction.event,
        quantity: totalQuantity,
        totalPrice: transaction.totalPrice,

        ticketType: {
          name: ticketTypes.join(", "),
        },
      };
    });

    const count = await prisma.transaction.count({ where: whereClause });
    return {
      data: transformedTransactions,
      meta: { page, take, total: count, totalPages: Math.ceil(count / take) },
    };
  } catch (error) {
    throw error;
  }
};
