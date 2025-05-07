import { TransactionStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { DeleteEventService } from "../services/dashboard-organizer/delete-organizer-event.service";
import { getAttendeesByEventSlugService } from "../services/dashboard-organizer/get-attendees-by-event-slug.service";
import { getOrganizerDashboardDataService } from "../services/dashboard-organizer/get-organizer-dashboard-data.service";
import { getOrganizerEventsService } from "../services/dashboard-organizer/get-organizer-events.service";
import { getOrganizerTransactionsService } from "../services/dashboard-organizer/get-organizer-transaction.service";
import { getTransactionStatusChartService } from "../services/dashboard-organizer/get-transaction-chart-data.service";
import { updateTransactionService } from "../services/dashboard-organizer/update-transaction.service";

export const getOrganizerEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const query = {
      userId,
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 10,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "createdAt",
      search: (req.query.search as string) || "",
    };
    const result = await getOrganizerEventsService(userId, query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getAttendeesByEventSlugController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventSlug = req.params.slug;
    const userId = res.locals.user.id;
    const query = {
      take: parseInt(req.query.take as string) || 10,
      page: parseInt(req.query.page as string) || 1,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as string) || "desc",
      search: (req.query.search as string) || "",
    };
    const results = await getAttendeesByEventSlugService(
      eventSlug,
      userId,
      query
    );
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
};

export const getTransactionStatusChartController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.user.id;

    const query = {
      timeRange:
        (req.query.timeRange as "7d" | "30d" | "90d" | "365d") || "365d",
    };

    if (!["7d", "30d", "90d", "365d"].includes(query.timeRange)) {
      res.status(400).json({
        message:
          "Parameter timeRange tidak valid. Gunakan 7d, 30d, 90d, atau 365d.",
      });
      return;
    }

    const results = await getTransactionStatusChartService(query, userId);

    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
};

export const getOrganizerDashboardDataController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dashboardData = await getOrganizerDashboardDataService(
      res.locals.user.id
    );

    res.status(200).json({
      data: dashboardData,
      message: "Berhasil mendapatkan data dashboard organizer",
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      take: parseInt(req.query.take as string) || 10,
      page: parseInt(req.query.page as string) || 1,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as string) || "desc",
      search: (req.query.search as string) || "",
      status: req.query.status
        ? req.query.status === "ALL"
          ? undefined
          : (req.query.status as TransactionStatus)
        : undefined,
    };

    const results = await getOrganizerTransactionsService(
      res.locals.user.id,
      query
    );

    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
};

export const DeleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;
    const eventId = parseInt(req.params.id);
    const result = await DeleteEventService(eventId, userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId, isAccepted, isRejected } = req.body;

    const result = await updateTransactionService(res.locals.user.id, {
      transactionId,
      isAccepted,
      isRejected,
    });

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
