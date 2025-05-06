import { NextFunction, Request, Response } from "express";
import { getSamplesService } from "../services/sample/get-samples.service";
import { ApiError } from "../utils/api-error";
import createTransactionService from "../services/transaction/create-transaction.service";
import prisma from "../config/prisma";

export const createTransactionController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authUserId = Number(res.locals.user.id);
      const result = await createTransactionService(
        authUserId,
        req.body,
      );
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
