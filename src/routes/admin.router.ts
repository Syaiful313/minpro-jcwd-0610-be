import { Router } from "express";
import {
  getUsersController,
  updateUserRoleController,
} from "../controllers/admin.controller";
import { verifyToken } from "../lib/jwt";

const router = Router();

router.get("/user-lists", verifyToken, getUsersController);
router.patch("/user-lists", verifyToken, updateUserRoleController);

export default router;
