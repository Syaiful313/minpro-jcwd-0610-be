import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

// export const getEventBySlugService = async (slug: string) => {
//   const event = await prisma.event.findFirst({
//     where: { slug, deletedAt: null },
//     include: {
//       ticketTypes: true,
//       vouchers: {
//         where: {
//           endDate: {
//             gte: new Date(),
//           },
//         },
//       },
//     },
//   });

//   if (!event) {
//     throw new ApiError(400, "Event not found");
//   }

//   return event;
// };

export const getEventBySlugService = async (slug: string) => {
  const event = await prisma.event.findFirst({
    where: { slug, deletedAt: null },
    include: {
      ticketTypes: {
        select: {
          name: true,
          price: true,
          quantity: true,
        },
      },
      vouchers: {
        where: {
          endDate: {  
            gte: new Date(),
          },
        },
      },
      organizer: {
        select: {
          companyName: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(400, "Event not found");
  }

  return {
    ...event,
    tickets: event.ticketTypes.map((ticket) => ({
      type: ticket.name,
      price: ticket.price,
      totalSeat: ticket.quantity,
    })),
  };
};