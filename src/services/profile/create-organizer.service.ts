import prisma from "../../config/prisma";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

interface OrganizerBody {
  companyName: string;
  companyWebsite: string;
  companyAddress: string;
  details: string;
}

export const createOrganizerService = async (
  body: OrganizerBody,
  npwp: Express.Multer.File,
  userId: number
) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const exitingOrganizer = await prisma.organizer.findFirst({
      where: {
        userId,
      },
    });

    if (exitingOrganizer) {
      throw new ApiError(400, "Organizer already exists");
    }

    if (user.role !== "USER") {
      throw new ApiError(400, "You is not a user");
    }
    const { secure_url } = await cloudinaryUpload(npwp);

    const result = await prisma.organizer.create({
      data: {
        ...body,
        npwp: secure_url,
        userId,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};
