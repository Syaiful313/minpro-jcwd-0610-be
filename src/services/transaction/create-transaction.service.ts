// import prisma from "../../config/prisma";
// import { ApiError } from "../../utils/api-error";
// import { generatePaymentCode } from "../../utils/payment"; // Assume this utility exists

// interface CreateTransactionBody {
//   userId: number;
//   tickets: { id: number; quantity: number }[];
//   eventId: number;
//   paymentMethod: 'BANK_TRANSFER'; // Menambahkan payment method
// }

// interface TicketPurchaseDetail {
//   ticketTypeId: number;
//   quantity: number;
//   price: number;
//   subtotal: number;
// }

// // Function to calculate total price and validate tickets
// const processTicketPurchase = async (
//   prismaClient: any,
//   tickets: { id: number; quantity: number }[]
// ): Promise<{ totalPrice: number; purchaseDetails: TicketPurchaseDetail[] }> => {
//   let totalPrice = 0;
//   const purchaseDetails: TicketPurchaseDetail[] = [];

//   for (const ticket of tickets) {
//     const ticketType = await prismaClient.ticketType.findUnique({
//       where: { id: ticket.id },
//       include: {
//         event: {
//           select: {
//             startDate: true,
//             status: true
//           }
//         }
//       }
//     });

//     if (!ticketType) {
//       throw new ApiError(404, `Ticket type with ID ${ticket.id} not found`);
//     }

//     // Validasi event masih aktif
//     if (ticketType.event.status !== 'ACTIVE') {
//       throw new ApiError(400, 'Event is not active for ticket purchase');
//     }

//     // Validasi event belum dimulai
//     if (new Date() > ticketType.event.startDate) {
//       throw new ApiError(400, 'Event has already started, tickets cannot be purchased');
//     }

//     // Validasi stok ticket
//     if (ticketType.quantity < ticket.quantity) {
//       throw new ApiError(400, `Not enough tickets available for ${ticketType.name}. Only ${ticketType.quantity} left`);
//     }

//     const subtotal = ticketType.price * ticket.quantity;
//     totalPrice += subtotal;

//     purchaseDetails.push({
//       ticketTypeId: ticket.id,
//       quantity: ticket.quantity,
//       price: ticketType.price,
//       subtotal
//     });
//   }

//   return { totalPrice, purchaseDetails };
// };

// export const createTransactionService = async (body: CreateTransactionBody) => {
//   const { userId, tickets, eventId, paymentMethod } = body;

//   // Validate if user exists
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       transactions: {
//         where: {
//           status: 'WAITING_FOR_PAYMENT'
//         }
//       }
//     }
//   });

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   // Cek apakah user masih memiliki transaksi yang pending
//   if (user.transactions.length > 0) {
//     throw new ApiError(400, "You have pending transaction. Please complete it first");
//   }

//   // Start transaction with Prisma
//   const transaction = await prisma.$transaction(async (prismaClient) => {
//     // Validate event exists and is active
//     const event = await prismaClient.event.findUnique({
//       where: { id: eventId }
//     });

//     if (!event) {
//       throw new ApiError(404, "Event not found");
//     }

//     if (event.status !== 'ACTIVE') {
//       throw new ApiError(400, "Event is not active");
//     }

//     // Process tickets and calculate total price
//     const { totalPrice, purchaseDetails } = await processTicketPurchase(prismaClient, tickets);

//     // Generate unique payment code
//     const paymentCode = generatePaymentCode();

//     // Set payment deadline (24 hours from now)
//     const paymentDeadline = new Date();
//     paymentDeadline.setHours(paymentDeadline.getHours() + 24);

//     // Create new transaction
//     const newTransaction = await prismaClient.transaction.create({
//       data: {
//         userId,
//         eventId,
//         totalPrice,
//         quantity: tickets.reduce((total, ticket) => total + ticket.quantity, 0),
//         status: "WAITING_FOR_PAYMENT",
//         paymentMethod,
//         paymentCode,
//         paymentDeadline,
//         createdAt: new Date(),
//         // Create transaction details
//         transactionDetails: {
//           create: purchaseDetails.map(detail => ({
//             ticketTypeId: detail.ticketTypeId,
//             quantity: detail.quantity,
//             price: detail.price,
//             subtotal: detail.subtotal
//           }))
//         }
//       },
//       include: {
//         transactionDetails: true,
//         event: {
//           select: {
//             name: true
//           }
//         }
//       }
//     });

//     // Update ticket quantities
//     for (const ticket of tickets) {
//       await prismaClient.ticketType.update({
//         where: { id: ticket.id },
//         data: {
//           quantity: {
//             decrement: ticket.quantity
//           }
//         }
//       });
//     }

//     return newTransaction;
//   });

//   return {
//     ...transaction,
//     paymentInstructions: {
//       paymentCode: transaction.paymentCode,
//       totalAmount: transaction.totalPrice,
//       paymentDeadline: transaction.paymentDeadline,
//       status: transaction.status
//     }
//   };
// };