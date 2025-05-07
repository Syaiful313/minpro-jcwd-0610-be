import { NextFunction, Request, Response } from "express";
import createTransactionService from "../services/transaction/create-transaction.service";
import getTransactionByIdService from "../services/transaction/get-transactionById.service";
import uploadPaymentProofService from "../services/transaction/upload-payment-proof.service";
import { cloudinaryUpload } from "../lib/cloudinary";
import { ApiError } from "../utils/api-error";
import getTransactionsByUserService from "../services/transaction/get-transactionByUser.service";

export const createTransactionController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const result = await createTransactionService(
        authUserId,
        req.body,
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };


export const getTransactionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = Number(req.params.id);

    if (isNaN(transactionId)) {
       res.status(400).json({ message: "ID transaksi tidak valid" });
    }

    const transaction = await getTransactionByIdService(transactionId);

    if (!transaction) {
      res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};




export const uploadPaymentProofController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = Number(res.locals.user.id); // Sesuaikan cara ambil user
    const transactionId = Number(req.params.id);

    const file = req.file;

    if (!file) {
      throw new ApiError(400, "Bukti pembayaran wajib diupload");
    }

    // ✅ Upload ke Cloudinary menggunakan fungsi yang sudah ada
    const result = await cloudinaryUpload(file);

    // Ambil URL publik dari hasil upload
    const paymentProofUrl = result.secure_url;

    // Kirim ke service
    const updatedTransaction = await uploadPaymentProofService(authUserId, {
      transactionId,
      proofUrl: paymentProofUrl,
    });

    res.status(200).json({
      message: "Bukti pembayaran berhasil diupload",
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};



export const getTransactionsByUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = Number(res.locals.user.id); // Sesuaikan cara ambil user

    if (isNaN(authUserId)) {
      throw new ApiError(400, "User ID tidak valid");
    }

    const result = await getTransactionsByUserService(authUserId);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};


