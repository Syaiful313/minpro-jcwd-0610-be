import { NextFunction, Request, Response } from "express";
import { getProfileService } from "../services/profile/get-profile.service";
import { updateProfileService } from "../services/profile/update-profile.service";
import { updatePasswordService } from "../services/profile/update-password.service";
import { createOrganizerService } from "../services/profile/create-organizer.service";
import { getReferralsService } from "../services/referral/get-referrals.service";
import { PaginationQueryParams } from "../types/pagination";
import { ApiError } from "../utils/api-error";

export const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(res.locals.user.id);
    const result = await getProfileService(userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldName: string]: Express.Multer.File[] };

    const result = await updateProfileService(
      req.body,
      files.profilePicture?.[0],
      res.locals.user.id
    );

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updatePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    const { currentPassword, newPassword } = req.body;

    const result = await updatePasswordService(
      token!,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const createOraganizerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const userId = Number(res.locals.user.id);
    const files = req.files as { [fieldName: string]: Express.Multer.File[] };
    const result = await createOrganizerService(body, files.npwp?.[0], userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
