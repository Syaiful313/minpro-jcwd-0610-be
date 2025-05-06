import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

const getTransactionByIdService = async (transactionId: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      transactionsDetails: {
        include: {
          ticketType: true,
        },
      },
      user: true,
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaksi tidak ditemukan");
  }

  return transaction;
};

export default getTransactionByIdService;