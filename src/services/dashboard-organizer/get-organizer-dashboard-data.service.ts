// src/services/organizerDashboardService.ts

import prisma from "../../config/prisma";

export const getOrganizerDashboardDataService = async (userId: number) => {
  try {
    // Verifikasi user adalah organizer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizer: true },
    });

    if (!user || !user.organizer) {
      throw new Error("User bukan organizer");
    }

    const organizerId = user.organizer.id;

    // Mendapatkan nama organizer
    const organizerName = user.organizer.companyName;

    // Mendapatkan total pendapatan (dari transaksi dengan status DONE)
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Mendapatkan jumlah event yang dibuat organizer
    const totalEvents = await prisma.event.count({
      where: {
        organizerId: organizerId,
        deletedAt: null, // Hanya menghitung event yang tidak dihapus
      },
    });

    // Mendapatkan jumlah tiket yang terjual (status DONE)
    const ticketsSold = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
      },
      _sum: {
        quantity: true,
      },
    });

    // Mendapatkan persentase pertumbuhan pendapatan (dibandingkan dengan bulan lalu)
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
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Pendapatan bulan ini
    const currentMonthRevenue = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        createdAt: {
          gte: firstDayCurrentMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Pendapatan bulan lalu
    const lastMonthRevenue = await prisma.transaction.aggregate({
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
        createdAt: {
          gte: firstDayLastMonth,
          lt: firstDayCurrentMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Menghitung persentase pertumbuhan pendapatan
    const currentRevenue = currentMonthRevenue._sum.totalPrice || 0;
    const lastRevenue = lastMonthRevenue._sum.totalPrice || 0;

    let revenueGrowth = 0;
    if (lastRevenue > 0) {
      revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueGrowth = 100; // Jika bulan lalu 0 tapi bulan ini > 0, pertumbuhan 100%
    }

    // Persentase pertumbuhan customer baru (berdasarkan transaksi unik)
    const currentMonthCustomers = await prisma.transaction.groupBy({
      by: ["userId"],
      where: {
        event: {
          organizerId: organizerId,
        },
        status: "DONE",
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
