import { Router } from "express";
import {
  getUsersController,
  rejectOrganizerController,
  updateUserRoleController,
  getPendingOrganizerController
} from "../controllers/admin.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.get("/user-lists", verifyToken, getUsersController);
router.post("/approve", verifyToken, updateUserRoleController);
router.post("/reject", verifyToken, rejectOrganizerController);
router.get("/organizers/pending", verifyToken, getPendingOrganizerController);

export default router;