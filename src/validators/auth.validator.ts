import { Response, Request, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const validateRegister = [
  body("fullName").notEmpty().withMessage("Name is required").isString(),
  body("email").notEmpty().withMessage("Email is not valid").isEmail(),
  body("password").notEmpty().withMessage("Password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array()[0].msg });
      return;
    }
    next();
  },
];

export const validateLogin = [
  body("email").notEmpty().withMessage("Email is not valid").isEmail(),
  body("password").notEmpty().withMessage("Password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array()[0].msg });
      return;
    }
    next();
  },
];

export const validateForgotPassword = [
  body("email").notEmpty().withMessage("Email is not valid").isEmail(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array()[0].msg });
      return;
    }
    next();
  },
];

export const validateResetPassword = [
  body("password").notEmpty().withMessage("Password is required"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array()[0].msg });
      return;
    }
    next();
  },
];
