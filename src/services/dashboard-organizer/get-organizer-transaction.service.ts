import { Prisma, TransactionStatus } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";
import { ApiError } from "../../utils/api-error";

interface GetTransactionsQuery extends PaginationQueryParams {
  search?: string;
  status?: TransactionStatus;
}

export const getOrganizerTransactionsService = async (
  userId: number,
  query: GetTransactionsQuery
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      include: { organizer: true },
    });

    if (!user) {
      throw new ApiError(404, "User tidak ditemukan");
    }

    if (user.role !== "ORGANIZER") {
      throw new ApiError(403, "Anda bukan organizer");
    }

    if (!user.organizer) {
      throw new ApiError(404, "Data organizer tidak ditemukan");
    }

    const {
      page = 1,
      take = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      status,
    } = query;

    const whereClause: Prisma.TransactionWhereInput = {
      event: {
        organizerId: user.organizer.id,
      },
      deletedAt: null,
      ...(search && {
        OR: [
          { user: { fullName: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { event: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(status && { status }),
    };

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        transactionsDetails: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * take,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const total = await prisma.transaction.count({
      where: whereClause,
    });

    return {
      data: transactions,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  } catch (error) {
    throw error;
  }
};
