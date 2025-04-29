import { Router } from "express";
import {
  createOraganizerController,
  getProfileController,
  updatePasswordController,
  updateProfileController
} from "../controllers/profile.controller";
import { fileFilter } from "../lib/fileFilter";
import { verifyToken } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { validateApplayOraganizer } from "../validators/organizer.validator";

const router = Router();

router.get("/", verifyToken, getProfileController);

router.patch(
  "/",
  verifyToken,
  uploader(2).fields([{ name: "profilePicture", maxCount: 1 }]),
  fileFilter,
  updateProfileController
);
router.patch("/password", verifyToken, updatePasswordController);
router.post(
  "/applay-organizer",
  verifyToken,
  uploader(2).fields([{ name: "npwp", maxCount: 1 }]),
  fileFilter,
  validateApplayOraganizer,
  createOraganizerController
);

export default router;
