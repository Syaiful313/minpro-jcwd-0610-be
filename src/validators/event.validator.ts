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

export const validateUpdateEvent = [
  body("category")
    .optional()
    .isIn(Object.values(Category))
    .withMessage(
      "Invalid category. Must be one of: Sports, Festivals, Concerts, Theater"
    ),
  body("name")
    .optional()
    .isString()
    .withMessage("Event name must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("location")
    .optional()
    .isIn(Object.values(Location))
    .withMessage("Invalid location"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid date format")
    .toDate(),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid date format")
    .toDate()
    .custom((endDate, { req }) => {
      // Validasi endDate hanya jika startDate juga disediakan
      if (req.body.startDate && endDate <= new Date(req.body.startDate)) {
        throw new Error("endDate must be after startDate");
      }
      return true;
    }),
  body("tickets")
    .optional()
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error("Tickets must be an array");
        }
        
        // Validasi setiap tiket jika array tidak kosong
        if (parsed.length > 0) {
          for (const ticket of parsed) {
            if (!ticket.name || typeof ticket.name !== "string") {
              throw new Error("Each ticket must have a valid name");
            }
            if (typeof ticket.price !== "number" || ticket.price < 0) {
              throw new Error("Each ticket must have a valid price");
            }
            if (typeof ticket.quantity !== "number" || ticket.quantity < 0) {
              throw new Error("Each ticket must have a valid quantity");
            }
          }
        }
        
        return true;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Invalid tickets format: " + error.message);
        }
        throw new Error("Invalid tickets format");
      }
    }),
  body("vouchers")
    .optional()
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error("Vouchers must be an array");
        }
        
        // Validasi setiap voucher jika array tidak kosong
        if (parsed.length > 0) {
          for (const voucher of parsed) {
            if (!voucher.code || typeof voucher.code !== "string") {
              throw new Error("Each voucher must have a valid code");
            }
            if (typeof voucher.discount !== "number" || voucher.discount <= 0) {
              throw new Error("Each voucher must have a valid discount");
            }
            if (typeof voucher.maxUsage !== "number" || voucher.maxUsage <= 0) {
              throw new Error("Each voucher must have a valid maxUsage");
            }
            if (!voucher.startDate) {
              throw new Error("Each voucher must have a valid startDate");
            }
            if (!voucher.endDate) {
              throw new Error("Each voucher must have a valid endDate");
            }
          }
        }
        
        return true;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Invalid vouchers format: " + error.message);
        }
        throw new Error("Invalid vouchers format");
      }
    }),
    
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      throw new ApiError(400, firstError.msg);
    }
    
    next();
  },
];