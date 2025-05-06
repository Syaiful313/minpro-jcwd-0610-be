// src/services/transactionStatusChartService.ts

import prisma from "../../config/prisma";
import { TransactionStatus } from "@prisma/client";

interface GetTransactionStatusChartQuery {
  timeRange: "7d" | "30d" | "90d" | "365d"; // Menambahkan opsi 365d
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
  query: GetTransactionStatusChartQuery
) => {
  try {
    const { timeRange } = query;

    let transactions;

    if (timeRange === "365d") {
      // Query untuk 1 tahun terakhir
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") AS "date",
          SUM(CASE WHEN "status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN "status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN "status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN "status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN "status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN "status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions"
        WHERE 
          "createdAt" >= NOW() - INTERVAL '365 days'
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else if (timeRange === "90d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") AS "date",
          SUM(CASE WHEN "status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN "status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN "status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN "status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN "status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN "status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions"
        WHERE 
          "createdAt" >= NOW() - INTERVAL '90 days'
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else if (timeRange === "30d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") AS "date",
          SUM(CASE WHEN "status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN "status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN "status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN "status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN "status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN "status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions"
        WHERE 
          "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else if (timeRange === "7d") {
      transactions = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") AS "date",
          SUM(CASE WHEN "status" = 'WAITING_FOR_PAYMENT' THEN 1 ELSE 0 END)::int AS "waiting",
          SUM(CASE WHEN "status" = 'WAITING_FOR_ADMIN_CONFIRMATION' THEN 1 ELSE 0 END)::int AS "confirmed",
          SUM(CASE WHEN "status" = 'DONE' THEN 1 ELSE 0 END)::int AS "done",
          SUM(CASE WHEN "status" = 'REJECTED' THEN 1 ELSE 0 END)::int AS "rejected",
          SUM(CASE WHEN "status" = 'CANCELED' THEN 1 ELSE 0 END)::int AS "canceled",
          SUM(CASE WHEN "status" = 'EXPIRED' THEN 1 ELSE 0 END)::int AS "expired"
        FROM "transactions"
        WHERE 
          "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY "date"
        ORDER BY "date";
      `;
    } else {
      throw new Error("Parameter timeRange tidak valid");
    }

    // Memastikan semua tanggal dalam rentang waktu terisi
    const result = await fillMissingDates(transactions as TransactionStatusChartData[], timeRange);

    return {
      data: result,
      message: "Berhasil mendapatkan data chart transaksi berdasarkan status",
    };
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mengisi tanggal yang hilang (tidak ada transaksi) dengan nilai 0
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

  // Membuat array tanggal untuk seluruh rentang waktu yang diminta
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Format tanggal ke bentuk YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Cari data untuk tanggal ini
    const found = data.find(
      (item) => new Date(item.date).toISOString().split('T')[0] === formattedDate
    );
    
    if (found) {
      result.push(found);
    } else {
      // Jika tidak ada data untuk tanggal ini, masukkan dengan nilai 0
      result.push({
        date: formattedDate,
        waiting: 0,
        confirmed: 0,
        done: 0,
        rejected: 0,
        canceled: 0,
        expired: 0
      });
    }
  }

  return result;
};