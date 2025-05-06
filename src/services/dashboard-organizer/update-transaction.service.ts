import { TransactionStatus } from "@prisma/client";
import prisma from "../../config/prisma";
import { sendTransactionEmail } from "../../lib/handlebars";
import { ApiError } from "../../utils/api-error";

interface UpdateTransactionsBody {
  transactionId: number;
  isAccepted: boolean;
  isRejected: boolean;
}

export const updateTransactionService = async (
  userId: number,
  body: UpdateTransactionsBody
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new ApiError(404, "ID pengguna tidak valid");
    }

    if (user.role !== "ORGANIZER") {
      throw new ApiError(403, "Anda bukan penyelenggara acara");
    }

    const { isAccepted, isRejected, transactionId } = body;

    if (!transactionId) {
      throw new ApiError(400, "ID transaksi tidak boleh kosong");
    }

    if (isAccepted === undefined && isRejected === undefined) {
      throw new ApiError(400, "Anda perlu menerima atau menolak transaksi");
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, deletedAt: null },
      include: {
        event: true,
        user: true,
        transactionsDetails: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new ApiError(404, "Transaksi tidak ditemukan");
    }

    const organizer = await prisma.organizer.findFirst({
      where: { userId },
    });

    if (!organizer) {
      throw new ApiError(404, "Data penyelenggara tidak ditemukan");
    }

    const event = await prisma.event.findFirst({
      where: {
        id: transaction.eventId,
        organizerId: organizer.id,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new ApiError(403, "Anda bukan penyelenggara acara ini");
    }

    if (transaction.status === TransactionStatus.WAITING_FOR_PAYMENT) {
      return {
        message: "Transaksi sedang menunggu pembayaran",
      };
    }

    if (transaction.status === TransactionStatus.DONE) {
      return {
        message: "Transaksi sudah diterima sebelumnya",
      };
    }

    if (transaction.status === TransactionStatus.REJECTED) {
      return {
        message: "Transaksi sudah ditolak sebelumnya",
      };
    }

    if (transaction.status === TransactionStatus.CANCELED) {
      return {
        message: "Transaksi sudah dibatalkan",
      };
    }

    if (transaction.status === TransactionStatus.EXPIRED) {
      return {
        message: "Transaksi sudah kedaluwarsa",
      };
    }

    let result;

    if (isRejected) {
      result = await prisma.$transaction(async (prisma) => {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.REJECTED,
          },
        });

        if (transaction.usedVoucherCode) {
          const voucher = await prisma.voucher.findFirst({
            where: { code: transaction.usedVoucherCode },
          });

          if (voucher) {
            await prisma.voucher.update({
              where: { id: voucher.id },
              data: {
                usageCount: { decrement: 1 },
              },
            });
          }
        }

        for (const detail of transaction.transactionsDetails) {
          await prisma.ticketType.update({
            where: { id: detail.ticketType.id },
            data: { quantity: { increment: detail.quantity } },
          });
        }

        if (transaction.usedPoint && transaction.pointAmount > 0) {
          await prisma.user.update({
            where: { id: transaction.userId },
            data: { point: { increment: transaction.pointAmount } },
          });
        }

        const totalPriceBeforeDiscount = transaction.transactionsDetails.reduce(
          (total, detail) => total + detail.quantity * detail.ticketType.price,
          0
        );
        const totalDiscount = totalPriceBeforeDiscount - transaction.totalPrice;

        const totalQuantity = transaction.transactionsDetails.reduce(
          (sum, detail) => sum + detail.quantity,
          0
        );

        if (transaction.user && transaction.user.email) {
          await sendTransactionEmail({
            email: transaction.user.email,
            name: transaction.user.fullName,
            transactionStatus: "Ditolak",
            ticketQuantity: String(totalQuantity),
            totalDiscount: totalDiscount.toFixed(2),
            total: transaction.totalPrice.toFixed(2),
            totalPrice: totalPriceBeforeDiscount.toFixed(2),
          });
        }

        return {
          message: "Transaksi berhasil ditolak",
        };
      });
    }

    if (isAccepted) {
      result = await prisma.$transaction(async (prisma) => {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.DONE,
            acceptedAt: new Date(),
          },
        });

        const totalPriceBeforeDiscount = transaction.transactionsDetails.reduce(
          (total, detail) => total + detail.quantity * detail.ticketType.price,
          0
        );
        const totalDiscount = totalPriceBeforeDiscount - transaction.totalPrice;

        const totalQuantity = transaction.transactionsDetails.reduce(
          (sum, detail) => sum + detail.quantity,
          0
        );

        if (transaction.user && transaction.user.email) {
          await sendTransactionEmail({
            email: transaction.user.email,
            name: transaction.user.fullName,
            transactionStatus: "Diterima",
            ticketQuantity: String(totalQuantity),
            totalDiscount: totalDiscount.toFixed(2),
            total: transaction.totalPrice.toFixed(2),
            totalPrice: totalPriceBeforeDiscount.toFixed(2),
          });
        }

        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: "TRANSACTION",
            message: `Transaksi Anda untuk acara ${event.name} telah diterima.`,
          },
        });

        return {
          message: "Transaksi berhasil diterima",
        };
      });
    }

    return result;
  } catch (error) {
    throw error;
  }
};
