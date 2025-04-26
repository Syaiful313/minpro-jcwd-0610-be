import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config/env";
import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

interface ProfileUpdateData {
  fullName?: string;
  bio?: string;
  profilePicture?: string;
}

export const updateProfileService = async (
  token: string,
  data: ProfileUpdateData,
  profilePictureFile?: Express.Multer.File
) => {
  if (!token) throw new ApiError(401, "Authentication token is required");

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY!) as TokenPayload;
    const userId = decoded.id;

    if (!userId) throw new ApiError(400, "Invalid token payload");

    if (Object.keys(data).length === 0 && !profilePictureFile) {
      throw new ApiError(400, "No profile data provided for update");
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    if (!currentUser) {
      throw new ApiError(404, "User not found");
    }

    if (profilePictureFile) {
      if (currentUser.profilePicture) {
        await cloudinaryRemove(currentUser.profilePicture);
      }

      const cloudinaryResponse = await cloudinaryUpload(profilePictureFile);

      data.profilePicture = cloudinaryResponse.secure_url;
    }

    await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        bio: true,
        profilePicture: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { message: "Profile updated successfully" };
  } catch (error) {
    throw error;
  }
};
