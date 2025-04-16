import { Router } from "express";
import {
  ForgotPasswordController,
  loginController,
  registerController,
  resetPasswordController,
} from "../controllers/auth.controller";
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "../validators/auth.validator";
import { verifyTokenReset } from "../lib/jwt";

const router = Router();

router.post("/register", validateRegister, registerController);
router.post("/login", validateLogin, loginController);
router.post(
  "/forgot-password",
  validateForgotPassword,
  ForgotPasswordController
);
router.patch(
  "/reset-password",
  verifyTokenReset,
  validateResetPassword,
  resetPasswordController
);

export default router;
