import { Router } from "express";
import { getSamplesController } from "../controllers/sample.controller";
import { createTransactionController } from "../controllers/transaction.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.post("/create",verifyToken, createTransactionController);

export default router;
