import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import prisma from "../../config/prisma";
import { Category, Location } from "@prisma/client";

interface TicketData {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface VoucherData {
  id?: string;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
}

interface UpdateEventBody {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  tickets: string;
  vouchers: string;
  currentThumbnail?: string;
}

export const updateEventService = async (
  body: UpdateEventBody,
  thumbnail: Express.Multer.File | undefined,
  userId: number
) => {
  try {
    const {
      id,
      name,
      description,
      category,
      location,
      startDate,
      endDate,
      tickets,
      vouchers,
      currentThumbnail,
    } = body;

    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      throw new Error("ID event tidak valid.");
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error("Format tanggal tidak valid.");
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
        ticketTypes: true,
        vouchers: true,
      },
    });

    if (!event) {
      throw new Error("Event tidak ditemukan");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizer: true },
    });

    if (!user || !user.organizer) {
      throw new Error("Hanya organizer yang dapat mengubah event");
    }

    if (event.organizerId !== user.organizer.id) {
      throw new Error("Anda tidak memiliki izin untuk mengubah event ini");
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        id: { not: eventId },
        name: name,
        deletedAt: null,
      },
    });

    if (existingEvent) {
      throw new Error("Event dengan nama yang sama sudah ada.");
    }

    let ticketsData: TicketData[] = [];
    try {
      ticketsData = JSON.parse(tickets);
    } catch (error) {
      throw new Error("Format data tiket tidak valid");
    }

    let vouchersData: VoucherData[] = [];
    try {
      vouchersData = JSON.parse(vouchers);
    } catch (error) {
      throw new Error("Format data voucher tidak valid");
    }

    let thumbnailUrl = currentThumbnail || event.thumbnail;
    if (thumbnail) {
      if (event.thumbnail) {
        try {
          await cloudinaryRemove(event.thumbnail);
        } catch (error) {
          console.error("Gagal menghapus thumbnail lama:", error);
        }
      }

      const uploadResult = await cloudinaryUpload(thumbnail);
      thumbnailUrl = uploadResult.secure_url;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const result = await prisma.$transaction(async (prismaClient) => {
      const updatedEvent = await prismaClient.event.update({
        where: { id: eventId },
        data: {
          name,
          slug,
          description,
          category: category as Category,
          location: location as Location,
          startDate: startDateObj,
          endDate: endDateObj,
          thumbnail: thumbnailUrl,
        },
      });

      const existingTicketIds = ticketsData
        .filter((ticket) => ticket.id)
        .map((ticket) => parseInt(ticket.id as string, 10));

      await prismaClient.ticketType.deleteMany({
        where: {
          eventId,
          id: {
            notIn: existingTicketIds.length > 0 ? existingTicketIds : undefined,
          },
        },
      });

      for (const ticket of ticketsData) {
        if (ticket.id) {
          await prismaClient.ticketType.update({
            where: { id: parseInt(ticket.id, 10) },
            data: {
              name: ticket.name,
              price: ticket.price,
              quantity: ticket.quantity,
            },
          });
        } else {
          await prismaClient.ticketType.create({
            data: {
              eventId,
              name: ticket.name,
              price: ticket.price,
              quantity: ticket.quantity,
            },
          });
        }
      }

      const existingVoucherIds = vouchersData
        .filter((voucher) => voucher.id)
        .map((voucher) => parseInt(voucher.id as string, 10));

      await prismaClient.voucher.deleteMany({
        where: {
          eventId,
          id: {
            notIn:
              existingVoucherIds.length > 0 ? existingVoucherIds : undefined,
          },
        },
      });

      for (const voucher of vouchersData) {
        const voucherStartDate = new Date(voucher.startDate);
        const voucherEndDate = new Date(voucher.endDate);

        if (voucher.id) {
          await prismaClient.voucher.update({
            where: { id: parseInt(voucher.id, 10) },
            data: {
              code: voucher.code,
              discount: voucher.discount,
              startDate: voucherStartDate,
              endDate: voucherEndDate,
              maxUsage: 100,
            },
          });
        } else {
          await prismaClient.voucher.create({
            data: {
              eventId,
              userId,
              code: voucher.code,
              discount: voucher.discount,
              startDate: voucherStartDate,
              endDate: voucherEndDate,
              maxUsage: 100,
            },
          });
        }
      }

      return updatedEvent;
    });

    return {
      message: "Event berhasil diperbarui",
      data: result,
    };
  } catch (error: any) {
    throw new Error(`Gagal memperbarui event: ${error.message}`);
  }
};
