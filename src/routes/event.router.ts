import { Router } from "express";
import {
  createEventController,
  createReviewController,
  deleteEventController,
  getEventByIdController,
  getEventBySlugController,
  getEventsController,
  getReviewsByEventIdController,
  updateEventController,
} from "../controllers/event.controller";
import { fileFilter } from "../lib/fileFilter";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import {
  validateCreateEvent,
  validateUpdateEvent,
} from "../validators/event.validator";

const router = Router();

router.get("/", getEventsController);
router.get("/:slug", getEventBySlugController);
router.get("/:id", verifyToken, getEventByIdController);
router.post(
  "/createevent",
  verifyToken,
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter,
  validateCreateEvent,
  createEventController
);
router.patch(
  "/update/:id",
  verifyToken,
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter,
  validateUpdateEvent,
  updateEventController
);
router.delete("/:id", verifyToken, deleteEventController);
router.post("/createreview", verifyToken, createReviewController);
router.get("/reviews/:eventId", getReviewsByEventIdController);

export default router;
