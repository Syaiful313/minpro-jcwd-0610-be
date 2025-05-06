import { Category, Location } from "@prisma/client";
import prisma from "../../config/prisma";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";
import { generateSlug } from "../../utils/generateSlug";

interface UpdateEventBody {
  name?: string;
  description?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  tickets?: string; // stringified JSON
  vouchers?: string; // stringified JSON
}

export const updateEventService = async (
  eventId: number,
  body: UpdateEventBody,
  userId: number,
  thumbnail?: Express.Multer.File
) => {
  // Validasi: hanya organizer
  const organizer = await prisma.organizer.findFirst({
    where: { userId },
  });

  if (!organizer) {
    throw new ApiError(403, "Only organizer can update events");
  }

  // Cek apakah event ada
  const existingEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId: organizer.id,
      deletedAt: null
    },
    include: {
      ticketTypes: true,
      vouchers: true
    }
  });

  if (!existingEvent) {
    throw new ApiError(404, "Event not found or you don't have permission to update it");
  }

  // Siapkan data untuk update
  const updateData: any = {};

  // Update nama dan slug jika ada perubahan nama
  if (body.name && body.name !== existingEvent.name) {
    // Cek duplikat nama event
    const duplicateEvent = await prisma.event.findFirst({
      where: { 
        name: body.name,
        id: { not: eventId } 
      },
    });

    if (duplicateEvent) {
      throw new ApiError(400, "Event name already exists");
    }

    updateData.name = body.name.toLowerCase();
    updateData.slug = generateSlug(body.name);
  }

  // Update thumbnail jika ada
  if (thumbnail) {
    const { secure_url } = await cloudinaryUpload(thumbnail);
    updateData.thumbnail = secure_url;
  }

  // Update field lainnya jika ada
  if (body.description) updateData.description = body.description;
  if (body.category) updateData.category = body.category as Category;
  if (body.location) updateData.location = body.location as Location;
  if (body.startDate) updateData.startDate = new Date(body.startDate);
  if (body.endDate) updateData.endDate = new Date(body.endDate);

  // Update event
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: updateData
  });

  // Update ticket types jika ada
  if (body.tickets) {
    const tickets = JSON.parse(body.tickets);
    
    // Hapus tiket yang lama
    await prisma.ticketType.deleteMany({
      where: { eventId: eventId }
    });

    // Buat tiket baru
    for (const ticket of tickets) {
      await prisma.ticketType.create({
        data: {
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          description: ticket.description || null,
          eventId: eventId
        }
      });
    }
  }

  // Update vouchers jika ada
  if (body.vouchers) {
    const vouchers = JSON.parse(body.vouchers);
    
    // Hapus voucher yang lama
    await prisma.voucher.deleteMany({
      where: { 
        eventId: eventId,
        userId: userId
      }
    });

    // Buat voucher baru
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
            eventId: eventId,
            userId: userId
          }
        });
      }
    }
  }

  return updatedEvent;
};