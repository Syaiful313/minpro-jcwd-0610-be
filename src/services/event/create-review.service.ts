import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";


export const createReviewService = async (
  userId: number,
  eventId: number,
  rating: number,
  reviewText: string | null
) => {
  try {
    // Cek apakah user memiliki transaksi DONE untuk event ini
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: "DONE",
    },
    
});
console.log(transaction);

    if (!transaction) {
      throw new ApiError(403, "Anda tidak memiliki akses untuk memberikan review.");
    }

    // Cek apakah event sudah selesai (lebih dari endDate)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || new Date() < event.endDate) {
      throw new ApiError(400, "Event belum selesai.");
    }

    // Simpan review ke database
    const review = await prisma.review.create({
      data: {
        userId,
        eventId,
        rating,
        review: reviewText,
      },
    });

    return review;
  } catch (error) {
    throw error;
  }
};