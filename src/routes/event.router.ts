import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  getEventBySlugController,
  getEventsController,
} from "../controllers/event.controller";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";
import { validateCreateEvent } from "../validators/event.validator";

const router = Router();

router.get("/", getEventsController);
router.get("/:slug", getEventBySlugController);
router.delete("/:id", verifyToken, deleteEventController);
router.post(
  "/createevent",
  verifyToken,
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter,
  validateCreateEvent,
  createEventController
);

export default router;
