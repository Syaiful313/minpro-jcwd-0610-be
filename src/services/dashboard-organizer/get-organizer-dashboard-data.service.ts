import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getOrganizerDashboardDataService = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      include: { organizer: true },
    });

    if (!user) {
      throw new ApiError(404, "User tidak ditemukan");
    }

    if (user.role !== "ORGANIZER") {
      throw new ApiError(403, "Anda bukan organizer");
    }

    if (!user.organizer) {
      throw new ApiError(404, "Data organizer tidak ditemukan");
    }

    const organizerId = user.organizer.id;

    const organizerName = user.organizer.companyName;

    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        deletedAt: null,
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalEvents = await prisma.event.count({
      where: {
        organizerId: organizerId,
        deletedAt: null,
      },
    });

    const ticketsSold = await prisma.transactionsDetail.aggregate({
      where: {
        transaction: {
          event: {
            organizerId: organizerId,
          },
          status: "DONE",
          deletedAt: null,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const today = new Date();
    const firstDayCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const firstDayLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const currentMonthRevenue = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        deletedAt: null,
        createdAt: {
          gte: firstDayCurrentMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const lastMonthRevenue = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        deletedAt: null,
        createdAt: {
          gte: firstDayLastMonth,
          lt: firstDayCurrentMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const currentRevenue = currentMonthRevenue._sum.totalPrice || 0;
    const lastRevenue = lastMonthRevenue._sum.totalPrice || 0;

    let revenueGrowth = 0;
    if (lastRevenue > 0) {
      revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueGrowth = 100;
    }

    const currentMonthCustomers = await prisma.transaction.groupBy({
      by: ["userId"],
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        deletedAt: null,
        createdAt: {
          gte: firstDayCurrentMonth,
        },
      },
    });

    const lastMonthCustomers = await prisma.transaction.groupBy({
      by: ["userId"],
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        deletedAt: null,
        createdAt: {
          gte: firstDayLastMonth,
          lt: firstDayCurrentMonth,
        },
      },
    });

    const currentCustomersCount = currentMonthCustomers.length;
    const lastCustomersCount = lastMonthCustomers.length;

    let customerGrowth = 0;
    if (lastCustomersCount > 0) {
      customerGrowth =
        ((currentCustomersCount - lastCustomersCount) / lastCustomersCount) *
        100;
    } else if (currentCustomersCount > 0) {
      customerGrowth = 100;
    }

    return {
      organizerName,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalEvents,
      ticketsSold: ticketsSold._sum.quantity || 0,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      customerGrowth: parseFloat(customerGrowth.toFixed(1)),
    };
  } catch (error) {
    throw error;
  }
};
