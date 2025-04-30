import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { generateSlug } from "../../utils/generateSlug";
import { Event } from "@prisma/client";

export const createEventService = async (
  body: Event,
  thumbnail: Express.Multer.File,
  userId: number
) => {
  const organizer = await prisma.organizer.findFirst({
    where: { userId },
  });

  if (!organizer) {
    throw new ApiError(403, "only organizer can create events");
  }

  const existingProduct = await prisma.event.findFirst({
    where: { name: body.name },
  });

  if (existingProduct) {
    throw new ApiError(400, "Event already exists");
  }

  const { secure_url } = await cloudinaryUpload(thumbnail);

  const slug = generateSlug(body.name);

  body.name = body.name.toLowerCase();
  body.thumbnail = secure_url;
  // body.price = Number(body.price);
  body.description = body.description;
  body.slug = slug;
  body.category = body.category;
  body.location = body.location;
  body.startDate = body.startDate;
  body.endDate = body.endDate;
  

  const newEvent = await prisma.event.create({
    data: { ...body, slug, thumbnail: secure_url,organizerId: organizer.id },
  });

  return newEvent;
};
