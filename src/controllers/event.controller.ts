import { NextFunction, Request, Response } from "express";
import { createEventService } from "../services/event/create-event.service";
import { deleteEventService } from "../services/event/delete-event.service";
import { getEventBySlugService } from "../services/event/get-event-by-slug.service";
import { getEventsService } from "../services/event/get-events.service";
import { ApiError } from "../utils/api-error";
import { getEventByIdService } from "../services/event/get-event-by-id.service";
import { updateEventService } from "../services/event/update-event.service";
import { createReviewService } from "../services/event/create-review.service";
import { getReviewsByEventIdService } from "../services/event/get-review-event.service";

export const getEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      page: parseInt(req.query.page as string) || 1,
      take: parseInt(req.query.take as string) || 3,
      sortOrder: (req.query.sortOrder as string) || "desc",
      sortBy: (req.query.sortBy as string) || "createdAt",
      search: (req.query.search as string) || "",
    };
    const result = await getEventsService(query);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getEventBySlugService(req.params.slug);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = Number(req.params.id);
    const userId = res.locals.user.id;

    if (isNaN(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const result = await getEventByIdService(eventId, userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files?.thumbnail?.[0];
    const userId = res.locals.user.id;

    const result = await updateEventService(
      eventId,
      req.body,
      userId,
      thumbnail
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    if (!thumbnail) {
      throw new ApiError(400, "Thumbnail image is required");
    }

    const userId = res.locals.user.id;
    const result = await createEventService(req.body, thumbnail, userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(res.locals.user);
    const userId = res.locals.user.id;
    const result = await deleteEventService(Number(req.params.id), userId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = Number(res.locals.user.id); // Dari middleware JWT
    const { eventId, rating, review } = req.body;

    if (!eventId || !rating) {
      throw new ApiError(400, "Data tidak lengkap");
    }

    const createdReview = await createReviewService(
      authUserId,
      Number(eventId),
      Number(rating),
      review
    );

    res.status(201).json(createdReview);
  } catch (error) {
    next(error);
  }
};



export const getReviewsByEventIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    if (!eventId || isNaN(Number(eventId))) {
      throw new ApiError(400, "ID event tidak valid");
    }

    const reviews = await getReviewsByEventIdService(Number(eventId));
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};