import { Category, Location } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export const validateCreateEvent = [
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(Object.values(Category))
    .withMessage(
      "Invalid category. Must be one of: Sports, Festivals, Concerts, Theater"
    ),
  body("name")
    .notEmpty()
    .withMessage("Event name is required and must be a string")
    .isString()
    .withMessage("Event name is required and must be a string"),
  body("description")
    .notEmpty()
    .withMessage("description is required and must be a string")
    .isString()
    .withMessage("description is required and must be a string"),
  body("location")
    .isIn(Object.values(Location))
    .withMessage("Invalid location"),
  body("startDate")
    .notEmpty()
    .withMessage("startDate is required and must be a string")
    .isISO8601()
    .withMessage("startDate mus be a valid  date format")
    .toDate(),
  body("endDate")
    .notEmpty()
    .withMessage("endDate is required and must be a string")
    .isISO8601()
    .withMessage("endDate mus be a valid  date format")
    .toDate(),
    
  (req: Request, _res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
          const firstError = errors.array()[0];
          throw new ApiError(400, firstError.msg );
        }
        
    next();
  },
];