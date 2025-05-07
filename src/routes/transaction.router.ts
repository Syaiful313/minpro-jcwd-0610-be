import { Router } from "express";
import {
  createTransactionController,
  getTransactionByIdController,
  getTransactionsByUserController,
  uploadPaymentProofController,
} from "../controllers/transaction.controller";
import { verifyToken } from "../lib/jwt";
import { UploaderMiddleware } from "../middlewares/uploader.middleware";

const router = Router();
const uploaderMiddleware = new UploaderMiddleware();

// Contoh middleware upload file dengan filter
const paymentProofUpload = uploaderMiddleware.upload(5).single("paymentProof"); // Max 5MB
const paymentProofFilter = uploaderMiddleware.fileFilter(["image/jpeg", "image/png"]);

router.post("/create", verifyToken, createTransactionController);
router.get("/:id", verifyToken, getTransactionByIdController);

// 🔁 Tambahkan route upload bukti transfer
router.post(
  "/upload-proof/:id",
  verifyToken,
  paymentProofUpload,
  paymentProofFilter,
  uploadPaymentProofController
);
router.get("/", verifyToken, getTransactionsByUserController);

export default router;