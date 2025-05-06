import { Router } from "express";
import {
  createEventController,
  deleteEventController,
  getEventBySlugController,
  getEventController,
  getEventsController,
  updateEventController,
} from "../controllers/event.controller";
import { fileFilter } from "../lib/fileFilter";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { validateCreateEvent } from "../validators/event.validator";

const router = Router();

router.get("/", getEventsController);
router.get("/:slug", getEventBySlugController);
router.get("/:id", getEventController);
router.post(
  "/createevent",
  verifyToken,
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter,
  validateCreateEvent,
  createEventController
);
router.patch(
  "/:id",
  verifyToken,
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter,
  validateCreateEvent,
  updateEventController
);
router.delete("/:id", verifyToken, deleteEventController);

export default router;
