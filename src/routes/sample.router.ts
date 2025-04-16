import { Router } from "express";
import { getSamplesController } from "../controllers/sample.controller";

const router = Router();

router.get("/", getSamplesController);

export default router;