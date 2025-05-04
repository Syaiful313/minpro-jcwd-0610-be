import { Router } from "express";
import {
  DeleteEventController,
  getAttendeesByEventSlugController,
  getOrganizerEventsController,
} from "../controllers/dashboard-organizer.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.get("/", verifyToken, getOrganizerEventsController);
router.get("/attendees/:slug", verifyToken, getAttendeesByEventSlugController);
router.delete("/:id", verifyToken, DeleteEventController);

export default router;
