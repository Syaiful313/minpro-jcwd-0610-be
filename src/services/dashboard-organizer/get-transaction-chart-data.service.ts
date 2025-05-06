import prisma from "../../config/prisma";

interface GetTransactionStatusChartQuery {
  timeRange: "7d" | "30d" | "90d" | "365d";
}

interface TransactionStatusChartData {
  date: string;
  waiting: number;
  confirmed: number;
  done: number;
  rejected: number;
  canceled: number;
  expired: number;
}

export const getTransactionStatusChartService = async (
  query: GetTransactionStatusChartQuery,
  userId: number
) => {
  try {
    const { timeRange } = query;

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user id");
    }

    if (user.role !== "ORGANIZER") {
      throw new Error("You are not an organizer");
    }

    const organizer = await prisma.organizer.findUnique({
      where: { userId: userId },
    });

    if (!organizer) {
      throw new Error("Organizer data not found");
    }

    let transactions;

    if (timeRange === "365d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE(t."createdAt") AS "date",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN t."status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN t."status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN t."status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN t."status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions" t
        JOIN "events" e ON t."eventId" = e."id"
        WHERE 
          t."createdAt" >= NOW() - INTERVAL '365 days'
          AND e."organizerId" = ${organizer.id}
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else if (timeRange === "90d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE(t."createdAt") AS "date",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN t."status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN t."status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN t."status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN t."status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions" t
        JOIN "events" e ON t."eventId" = e."id"
        WHERE 
          t."createdAt" >= NOW() - INTERVAL '90 days'
          AND e."organizerId" = ${organizer.id}
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else if (timeRange === "30d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE(t."createdAt") AS "date",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN t."status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN t."status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN t."status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN t."status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions" t
        JOIN "events" e ON t."eventId" = e."id"
        WHERE 
          t."createdAt" >= NOW() - INTERVAL '30 days'
          AND e."organizerId" = ${organizer.id}
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else if (timeRange === "7d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE(t."createdAt") AS "date",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN t."status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN t."status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN t."status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN t."status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN t."status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions" t
        JOIN "events" e ON t."eventId" = e."id"
        WHERE 
          t."createdAt" >= NOW() - INTERVAL '7 days'
          AND e."organizerId" = ${organizer.id}
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else {
      throw new Error("Parameter timeRange tidak valid");
    }

    const result = await fillMissingDates(
      transactions as TransactionStatusChartData[],
      timeRange
    );

    return {
      data: result,
      message: "Berhasil mendapatkan data chart transaksi berdasarkan status",
    };
  } catch (error) {
    throw error;
  }
};

const fillMissingDates = async (
  data: TransactionStatusChartData[],
  timeRange: "7d" | "30d" | "90d" | "365d"
): Promise<TransactionStatusChartData[]> => {
  const result: TransactionStatusChartData[] = [];
  const today = new Date();
  let days = 0;

  if (timeRange === "7d") days = 7;
  else if (timeRange === "30d") days = 30;
  else if (timeRange === "90d") days = 90;
  else if (timeRange === "365d") days = 365;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const formattedDate = date.toISOString().split("T")[0];

    const found = data.find(
      (item) =>
        new Date(item.date).toISOString().split("T")[0] === formattedDate
    );

    if (found) {
      result.push(found);
    } else {
      result.push({
        date: formattedDate,
        waiting: 0,
        confirmed: 0,
        done: 0,
        rejected: 0,
        canceled: 0,
        expired: 0,
      });
    }
  }

  return result;
};
