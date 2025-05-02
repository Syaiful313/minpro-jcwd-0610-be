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

  const { page, take, sortBy, sortOrder, search } = queries;

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
  });

  const count = await prisma.event.count({ where: whereClause });

  return {
    data: events,
    meta: { page, take, total: count },
  };
};
