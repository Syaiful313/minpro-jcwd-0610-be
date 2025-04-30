import { Router } from "express";
import { getOrganizerEventsController } from "../controllers/dashboard-organizer.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.get("/", verifyToken, getOrganizerEventsController);

export default router;
