import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { generateSlug } from "../../utils/generateSlug";
import { Event, Category, Location} from "@prisma/client";

// export const createEventService = async (
//   body: Event,
//   thumbnail: Express.Multer.File,
//   userId: number
// ) => {
//   const organizer = await prisma.organizer.findFirst({
//     where: { userId },
//   });

//   if (!organizer) {
//     throw new ApiError(403, "only organizer can create events");
//   }

//   const existingProduct = await prisma.event.findFirst({
//     where: { name: body.name },
//   });

//   if (existingProduct) {
//     throw new ApiError(400, "Event already exists");
//   }

//   const { secure_url } = await cloudinaryUpload(thumbnail);

//   const slug = generateSlug(body.name);

//   body.name = body.name.toLowerCase();
//   body.thumbnail = secure_url;
//   // body.price = Number(body.price);
//   body.description = body.description;
//   body.slug = slug;
//   body.category = body.category;
//   body.location = body.location;
//   body.startDate = body.startDate;
//   body.endDate = body.endDate;
  

//   const newEvent = await prisma.event.create({
//     data: { ...body, slug, thumbnail: secure_url,organizerId: organizer.id },
//   });

//   return newEvent;
// };



interface CreateEventBody {
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  totalSeat: string;
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
  const totalSeat = parseInt(body.totalSeat);

  // Buat event
  const newEvent = await prisma.event.create({
    data: {
      name: body.name.toLowerCase(),
      description: body.description,
      category: body.category as Category,
      location: body.location as Location,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      totalSeat,
      thumbnail: secure_url,
      slug,
      organizerId: organizer.id,
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