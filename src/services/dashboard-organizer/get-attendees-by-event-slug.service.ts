import { Prisma, TransactionStatus } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";

interface GetAttendeeQuery extends PaginationQueryParams {
  search: string;
}

export const getAttendeesByEventSlugService = async (
  eventSlug: string,
  userId: number,
  query: GetAttendeeQuery
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user id");
    }

    if (user.role !== "ORGANIZER") {
      throw new Error("You are not an organizer");
    }

    const organizer = await prisma.organizer.findFirst({
      where: { userId: userId },
    });

    if (!organizer) {
      throw new Error("Organizer profile not found");
    }

    const event = await prisma.event.findFirst({
      where: { slug: eventSlug },
    });

    if (!event) {
      throw new Error("Invalid event slug");
    }

    if (event.organizerId !== organizer.id) {
      throw new Error("You are not authorized to view this event");
    }

    const { page, sortBy, sortOrder, take, search } = query;

    const whereClause: Prisma.TransactionWhereInput = {
      event: { slug: eventSlug },
      status: TransactionStatus.DONE,
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
        // quantity: true,
        totalPrice: true,
        // ticketType: {
        //   select: {
        //     name: true,
        //   },
        // },
      },
    });

    const count = await prisma.transaction.count({ where: whereClause });
    return {
      data: transactions,
      meta: { page, take, total: count },
    };
  } catch (error) {
    throw error;
  }
};
