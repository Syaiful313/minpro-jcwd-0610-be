import { NextFunction, Request, Response } from "express";
import { createEventService } from "../services/event/create-event.service";
import { deleteEventService } from "../services/event/delete-event.service";
import { getEventBySlugService } from "../services/event/get-event-by-slug.service";
import { getEventsService } from "../services/event/get-events.service";
import { updateEventService } from "../services/event/update-event.service";
import { ApiError } from "../utils/api-error";
import { getEventService } from "../services/event/get-event.service";

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

export const getEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await getEventService(id);

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

export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals.user.id;

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Anda harus login terlebih dahulu",
      });
      return;
    }

    const thumbnail = req.file;
    const result = await updateEventService(req.body, thumbnail, userId);

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
