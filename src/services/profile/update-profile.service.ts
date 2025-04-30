import prisma from "../../config/prisma";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";

interface UpdateProfileBody {
  fullname: string;
  bio: string;
}

export const updateProfileService = async (
  body: UpdateProfileBody,
  profilePicture: Express.Multer.File | undefined,
  userId: number
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user id");
    }

    let secure_url: string | undefined;
    if (profilePicture) {
      if (user.profilePicture !== null) {
        await cloudinaryRemove(user.profilePicture);
      }

      const uploadResult = await cloudinaryUpload(profilePicture);
      secure_url = uploadResult.secure_url;
    }

    await prisma.user.update({
      where: { id: userId },
      data: secure_url ? { ...body, profilePicture: secure_url } : body,
    });

    return { message: "Update profile success" };
  } catch (error) {
    throw error;
  }
};
