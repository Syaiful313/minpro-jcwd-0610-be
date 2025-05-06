import { setInterval } from "node:timers";
import prisma from "../config/prisma";

async function checkExpiredTransactions() {
  const now = new Date();

  // Cari transaksi yang kadaluarsa
  const expired = await prisma.transaction.findMany({
    where: {
      expiredAt: { lte: now },
      status: {
        in: ["WAITING_FOR_PAYMENT", "WAITING_FOR_ADMIN_CONFIRMATION"],
      },
    },
  });

  // Update status jadi EXPIRED
  for (const tx of expired) {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: "EXPIRED",
      },
    });
  }

  console.log(`[Scheduler] ${expired.length} transaksi kadaluarsa.`);
}

// Jalankan tiap 1 menit
export default function startTransactionExpirationJob() {
  setInterval(checkExpiredTransactions, 60 * 1000);
}