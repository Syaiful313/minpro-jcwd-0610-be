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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const result = await getProfileService(token!);
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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Authentication token is required",
      });
      return;
    }

    const updateData: {
      fullName?: string;
      bio?: string;
    } = {};

    if (req.body.fullName) updateData.fullName = req.body.fullName;
    if (req.body.bio) updateData.bio = req.body.bio;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const profilePictureFile = files?.profilePicture?.[0];

    const result = await updateProfileService(
      token,
      updateData,
      profilePictureFile
    );

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: result,
    });
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
