import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

const getTransactionsByUserService = async (userId: number) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        transactionsDetails: {
          include: {
            ticketType: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!transactions || transactions.length === 0) {
      throw new ApiError(404, "Belum ada transaksi");
    }

    return transactions;
  } catch (error) {
    throw new ApiError(500, "Gagal mengambil riwayat transaksi");
  }
};

export default getTransactionsByUserService;