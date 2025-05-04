import { Prisma } from "@prisma/client";
import { PaginationQueryParams } from "../../types/pagination";
import prisma from "../../config/prisma";

interface GetEventsService extends PaginationQueryParams {
  search: string;
}

// export const getEventsService = async (queries: GetEventsService) => {
//   const { page, take, sortBy, sortOrder, search } = queries;

//   const whereClause: Prisma.EventWhereInput = {
//     deletedAt: null
//   };

//   if (search) {
//     whereClause.name = { contains: search, mode: "insensitive" };
//   }

//   const products = await prisma.event.findMany({
//     where: whereClause,
//     skip: (page - 1) * take,
//     take: take,
//     orderBy: { [sortBy]: sortOrder },
//   });

//   const count = await prisma.event.count({ where: whereClause });

//   return { data: products, meta: { page, take, total: count } };
// };

export const getEventsService = async (queries: GetEventsService) => {
  const { page, take, sortBy, sortOrder, search } = queries;

  const whereClause: Prisma.EventWhereInput = {
    deletedAt: null,
  };

  if (search) {
    whereClause.name = { contains: search, mode: "insensitive" };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    skip: (page - 1) * take,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      organizer: {
        select: {
          companyName: true,
        },
      },
    },
  });

  const count = await prisma.event.count({
    where: whereClause,
  });

  return { data: events, meta: { page, take, total: count } };
};