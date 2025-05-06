// import prisma from "../../config/prisma";
// import { ApiError } from "../../utils/api-error";

// // export const getEventBySlugService = async (slug: string) => {
// //   const event = await prisma.event.findFirst({
// //     where: { slug, deletedAt: null },
// //     include: {
// //       ticketTypes: true,
// //       vouchers: {
// //         where: {
// //           endDate: {
// //             gte: new Date(),
// //           },
// //         },
// //       },
// //     },
// //   });

// //   if (!event) {
// //     throw new ApiError(400, "Event not found");
// //   }

// //   return event;
// // };

// export const getEventBySlugService = async (slug: string) => {
//   const event = await prisma.event.findFirst({
//     where: { slug, deletedAt: null },
//     include: {
//       ticketTypes: {
//         select: {
//           name: true,
//           price: true,
//           quantity: true,
//         },
//       },
//       vouchers: {
//         where: {
//           endDate: {  
//             gte: new Date(),
//           },
//         },
//       },
//       organizer: {
//         select: {
//           companyName: true,
//         },
//       },
//     },
//   });

//   if (!event) {
//     throw new ApiError(400, "Event not found");
//   }

//   return {
//     ...event,
//     tickets: event.ticketTypes.map((ticket) => ({
//       type: ticket.name,
//       price: ticket.price,
//       totalSeat: ticket.quantity,
//     })),
//   };
// };

// import prisma from "../../config/prisma";
// import { ApiError } from "../../utils/api-error";

// // Define interfaces based on the schema
// interface Organizer {
//   companyName: string;
// }

// interface TicketType {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   description?: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface Voucher {
//   id: number;
//   code: string;
//   discount: number;
//   maxUsage: number;
//   usageCount: number;
//   startDate: Date;
//   endDate: Date;
// }

// interface Event {
//   id: number;
//   organizerId: number;
//   organizer: Organizer;
//   slug: string;
//   name: string;
//   thumbnail: string;
//   category: 'Sports' | 'Festivals' | 'Concerts' | 'Theater';
//   location: string;
//   description: string;
//   startDate: Date;
//   endDate: Date;
//   ticketTypes: TicketType[];
//   vouchers: Voucher[];
//   createdAt: Date;
//   updatedAt: Date;
// }
// // Define interfaces based on the schema
// interface Organizer {
//   companyName: string;
// }

// interface TicketType {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   description?: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface Voucher {
//   id: number;
//   code: string;
//   discount: number;
//   maxUsage: number;
//   usageCount: number;
//   startDate: Date;
//   endDate: Date;
// }

// interface Event {
//   id: number;
//   organizerId: number;
//   organizer: Organizer;
//   slug: string;
//   name: string;
//   thumbnail: string;
//   category: "Sports" | "Festivals" | "Concerts" | "Theater";
//   location: string;
//   description: string;
//   startDate: Date;
//   endDate: Date;
//   ticketTypes: TicketType[];
//   vouchers: Voucher[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// export const getEventBySlugService = async (slug: string) => {
//   const event = await prisma.event.findFirst({
//     where: { 
//       slug,
//       deletedAt: null 
//     },
//     where: {
//       slug,
//       deletedAt: null,
//     },
//     include: {
//       organizer: {
//         select: {
//           companyName: true,
//         },
//       },
//       organizer: {
//         select: {
//           companyName: true,
//         },
//       },
//       ticketTypes: {
//         select: {
//           id: true,
//           id: true,
//           name: true,
//           price: true,
//           quantity: true,
//           description: true,
//           createdAt: true,
//           updatedAt: true
//         }
//           description: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//       vouchers: {
//         where: {
//           endDate: {
//           endDate: {
//             gte: new Date(),
//           },
//         },
//         select: {
//           id: true,
//           code: true,
//           discount: true,
//           maxUsage: true,
//           usageCount: true,
//           startDate: true,
//           endDate: true,
//         }
//       }
//     }
//           id: true,
//           code: true,
//           discount: true,
//           maxUsage: true,
//           usageCount: true,
//           startDate: true,
//           endDate: true,
//         },
//       },
//     },
//   });

//   if (!event) {
//     throw new ApiError(404, "Event not found");
//     throw new ApiError(404, "Event not found");
//   }

//   return {
//     id: event.id,
//     organizerId: event.organizerId,
//     organizer: event.organizer,
//     slug: event.slug,
//     name: event.name,
//     thumbnail: event.thumbnail,
//     category: event.category,
//     location: event.location,
//     description: event.description,
//     startDate: event.startDate,
//     endDate: event.endDate,
//     id: event.id,
//     organizerId: event.organizerId,
//     organizer: event.organizer,
//     slug: event.slug,
//     name: event.name,
//     thumbnail: event.thumbnail,
//     category: event.category,
//     location: event.location,
//     description: event.description,
//     startDate: event.startDate,
//     endDate: event.endDate,
//     tickets: event.ticketTypes.map((ticket) => ({
//       id: ticket.id,
//       id: ticket.id,
//       type: ticket.name,
//       price: ticket.price,
//       totalSeat: ticket.quantity,
//       description: ticket.description,
//       createdAt: ticket.createdAt,
//       updatedAt: ticket.updatedAt
//     })),
//     vouchers: event.vouchers.map((voucher) => ({
//       id: voucher.id,
//       code: voucher.code,
//       discount: voucher.discount,
//       maxUsage: voucher.maxUsage,
//       usageCount: voucher.usageCount,
//       startDate: voucher.startDate,
//       endDate: voucher.endDate
//     })),
//     createdAt: event.createdAt,
//     updatedAt: event.updatedAt
//       description: ticket.description,
//       createdAt: ticket.createdAt,
//       updatedAt: ticket.updatedAt,
//     })),
//     vouchers: event.vouchers.map((voucher) => ({
//       id: voucher.id,
//       code: voucher.code,
//       discount: voucher.discount,
//       maxUsage: voucher.maxUsage,
//       usageCount: voucher.usageCount,
//       startDate: voucher.startDate,
//       endDate: voucher.endDate,
//     })),
//     createdAt: event.createdAt,
//     updatedAt: event.updatedAt,
//   };
// };

import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

// Define interfaces based on the schema
interface Organizer {
  companyName: string;
}

interface TicketType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Voucher {
  id: number;
  code: string;
  discount: number;
  maxUsage: number;
  usageCount: number;
  startDate: Date;
  endDate: Date;
}

interface Event {
  id: number;
  organizerId: number;
  organizer: Organizer;
  slug: string;
  name: string;
  thumbnail: string;
  category: 'Sports' | 'Festivals' | 'Concerts' | 'Theater';
  location: string;
  description: string;
  startDate: Date;
  endDate: Date;
  ticketTypes: TicketType[];
  vouchers: Voucher[];
  createdAt: Date;
  updatedAt: Date;
}

export const getEventBySlugService = async (slug: string) => {
  const event = await prisma.event.findFirst({
    where: { 
      slug,
      deletedAt: null 
    },
    include: {
      organizer: {
        select: {
          companyName: true,
        },
      },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      },
      vouchers: {
        where: {
          endDate: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          code: true,
          discount: true,
          maxUsage: true,
          usageCount: true,
          startDate: true,
          endDate: true,
        }
      }
    }
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return {
    id: event.id,
    organizerId: event.organizerId,
    organizer: event.organizer,
    slug: event.slug,
    name: event.name,
    thumbnail: event.thumbnail,
    category: event.category,
    location: event.location,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    tickets: event.ticketTypes.map((ticket) => ({
      id: ticket.id,
      type: ticket.name,
      price: ticket.price,
      totalSeat: ticket.quantity,
      description: ticket.description,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    })),
    vouchers: event.vouchers.map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      discount: voucher.discount,
      maxUsage: voucher.maxUsage,
      usageCount: voucher.usageCount,
      startDate: voucher.startDate,
      endDate: voucher.endDate
    })),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
};