import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface UploadPaymentProofInput {
  transactionId: number;
  proofUrl: string;
}

const uploadPaymentProofService = async (
  authUserId: number,
  input: UploadPaymentProofInput
) => {
  const { transactionId, proofUrl } = input;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaksi tidak ditemukan");
  }

  if (transaction.userId !== authUserId) {
    throw new ApiError(403, "Anda tidak memiliki akses ke transaksi ini");
  }

  if (transaction.status !== "WAITING_FOR_PAYMENT") {
    throw new ApiError(400, "Transaksi tidak dalam status yang sesuai");
  }

  // Set timer 24 jam
  const twentyFourHoursLater = new Date();
  twentyFourHoursLater.setHours(twentyFourHoursLater.getHours() + 24);

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      paymentProofUrl: proofUrl,
      status: "WAITING_FOR_ADMIN_CONFIRMATION",
      expiredAt: twentyFourHoursLater,
    },
  });

  return updated;
};

export default uploadPaymentProofService;