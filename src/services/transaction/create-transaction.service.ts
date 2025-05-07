import { Transaction } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { TransactionFrontend } from "../../types/transactionFrontend";

const createTransactionService = async (
  authUserId: number,
  body: TransactionFrontend
) => {
  if (!body.details || body.details.length === 0) {
    throw new ApiError(400, "Details cannot be empty");
  }

  // Cari user
  const user = await prisma.user.findUnique({
    where: { id: authUserId },
  });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // Ambil eventId dari ticket pertama
  const firstTicket = await prisma.ticketType.findFirst({
    where: { id: body.details[0].ticketTypeId },
    select: { eventId: true },
  });

  if (!firstTicket) {
    throw new ApiError(400, "First ticket not found");
  }

  // Pastikan semua tiket berasal dari event yang sama
  for (const detail of body.details) {
    const ticket = await prisma.ticketType.findFirst({
      where: { id: detail.ticketTypeId },
      select: { eventId: true },
    });

    if (!ticket) {
      throw new ApiError(400, `Ticket ID ${detail.ticketTypeId} not found`);
    }

    if (ticket.eventId !== firstTicket.eventId) {
      throw new ApiError(
        400,
        `Ticket ID ${detail.ticketTypeId} is not part of the same event`
      );
    }
  }

  // Validasi voucher jika ada
  let voucherDiscount = 0;
  if (body.voucherCode) {
    const voucher = await prisma.voucher.findFirst({
      where: {
        code: body.voucherCode,
        eventId: firstTicket.eventId,
        endDate: { gt: new Date() },
      },
    });

    if (!voucher) {
      throw new ApiError(400, "Invalid or expired voucher for this event");
    }

    voucherDiscount = voucher.discount;
  }

  // Validasi coupon jika ada
  let couponDiscount = 0;
  if (body.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: body.couponCode,
        userId: authUserId,
        isUsed: false,
      },
    });

    if (coupon) {
      couponDiscount = coupon.amount;
    }
  }

  // Hitung waktu expired (2 jam dari sekarang)
  const expiredAt = new Date();
  expiredAt.setHours(expiredAt.getHours() + 2);

  // Proses transaksi dengan $transaction
  const newTransaction = await prisma.$transaction(async (tx) => {
    let totalToPay = 0;

    for (const detail of body.details) {
      const ticket = await tx.ticketType.findFirst({
        where: { id: detail.ticketTypeId },
      });

      if (!ticket) {
        throw new ApiError(400, `Ticket ID ${detail.ticketTypeId} not found`);
      }

      if (detail.quantity > ticket.quantity) {
        throw new ApiError(
          422,
          `Insufficient stock for Ticket ID ${detail.ticketTypeId}`
        );
      }

      // Update stok tiket
      await tx.ticketType.update({
        where: { id: detail.ticketTypeId },
        data: { quantity: { decrement: detail.quantity } },
      });

      // Hitung subtotal per tiket
      const subtotal = (ticket.price - voucherDiscount) * detail.quantity;

      if (subtotal < 0) {
        throw new ApiError(400, "Total after discount cannot be negative");
      }

      totalToPay += subtotal;
    }

    // Kurangi dengan coupon
    totalToPay -= couponDiscount;
    totalToPay = totalToPay < 0 ? 0 : totalToPay;

    // Gunakan poin
    const usedPoints = totalToPay < user.point ? totalToPay : user.point;
    totalToPay -= usedPoints;

    // Update poin user jika digunakan
    if (usedPoints > 0) {
      await tx.user.update({
        where: { id: authUserId },
        data: { point: { decrement: usedPoints } },
      });
    }

    // Tandai coupon sebagai dipakai
    if (body.couponCode && couponDiscount > 0) {
      await tx.coupon.updateMany({
        where: {
          code: body.couponCode,
          userId: authUserId,
        },
        data: { isUsed: true },
      });
    }

    // Buat transaksi dengan status & expiredAt
    const transaction = await tx.transaction.create({
      data: {
        totalPrice: totalToPay,
        userId: authUserId,
        eventId: firstTicket.eventId,
        pointAmount: usedPoints,
        usedVoucherCode: body.voucherCode || null,
        usedPoint: body.usePoints || false,
        status: "WAITING_FOR_PAYMENT", 
        expiredAt, 
      },
    });

    // Simpan detail transaksi
    await tx.transactionsDetail.createMany({
      data: body.details.map((detail) => ({
        transactionId: transaction.id,
        ticketTypeId: detail.ticketTypeId,
        quantity: detail.quantity,
      })),
    });

    return transaction;
  });

  return {
    message: "Transaction successful",
    data: newTransaction,
  };
};

export default createTransactionService;
