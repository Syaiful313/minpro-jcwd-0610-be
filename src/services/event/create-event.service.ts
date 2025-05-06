import { Category, Location } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";
import { generateSlug } from "../../utils/generateSlug";

interface CreateEventBody {
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  tickets: string; // stringified JSON
  vouchers: string; // stringified JSON
}

export const createEventService = async (
  body: CreateEventBody,
  thumbnail: Express.Multer.File,
  userId: number
) => {
  // Validasi: hanya organizer
  const organizer = await prisma.organizer.findFirst({
    where: { userId },
  });

  if (!organizer) {
    throw new ApiError(403, "Only organizer can create events");
  }

  // Cek duplikat nama event
  const existingEvent = await prisma.event.findFirst({
    where: { name: body.name },
  });

  if (existingEvent) {
    throw new ApiError(400, "Event already exists");
  }

  // Upload thumbnail
  const { secure_url } = await cloudinaryUpload(thumbnail);

  // Generate slug dan parsing data
  const slug = generateSlug(body.name);
  const tickets = JSON.parse(body.tickets);

  // Cek minimal satu tiket
  if (tickets.length < 1) {
    throw new ApiError(400, "At least one ticket type is required");
  }

  const vouchers = body.vouchers ? JSON.parse(body.vouchers) : [];

  // Buat event
  const newEvent = await prisma.event.create({
    data: {
      name: body.name.toLowerCase(),
      description: body.description,
      category: body.category as Category,
      location: body.location as Location,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      thumbnail: secure_url,
      slug,
      organizerId: organizer.id,
      userId: userId,
    },
  });

  // Buat jenis tiket
  for (const ticket of tickets) {
    await prisma.ticketType.create({
      data: {
        name: ticket.name,
        price: ticket.price,
        quantity: ticket.quantity,
        eventId: newEvent.id,
      },
    });
  }

  // Buat voucher jika ada
  if (vouchers.length > 0) {
    for (const voucher of vouchers) {
      if (!voucher.startDate || !voucher.endDate) {
        throw new ApiError(400, "Voucher dates are required");
      }

      await prisma.voucher.create({
        data: {
          code: voucher.code,
          discount: voucher.discount,
          maxUsage: voucher.maxUsage,
          usageCount: 0,
          startDate: new Date(voucher.startDate),
          endDate: new Date(voucher.endDate),
          eventId: newEvent.id,
          userId: userId,
        },
      });
    }
  }

  return newEvent;
};
