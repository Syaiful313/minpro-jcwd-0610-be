import { Router } from "express";
import { getReferralsController } from "../controllers/referral.controller";

const router = Router();

router.get("/", getReferralsController);

export default router;
