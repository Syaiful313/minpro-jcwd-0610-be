import express from "express";
import { getCouponsController } from "../controllers/coupon.controller";

const router = express.Router();

router.get("/", getCouponsController);

export default router;