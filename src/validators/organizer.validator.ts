import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateApplayOraganizer = [
  body("companyName").notEmpty().withMessage("Company name is required"),
  body("companyWebsite").notEmpty().withMessage("Company website is required"),
  body("companyAddress").notEmpty().withMessage("Company address is required"),
  body("details").notEmpty().withMessage("Details is required"),


  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array()[0].msg });
      return;
    }
    next();
  },
];
