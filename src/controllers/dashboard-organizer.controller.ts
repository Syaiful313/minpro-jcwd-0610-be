import { NextFunction, Request, Response } from "express";
import { DeleteEventService } from "../services/dashboard-organizer/delete-organizer-event.service";
import { getAttendeesByEventSlugService } from "../services/dashboard-organizer/get-attendees-by-event-slug.service";
import { getOrganizerEventsService } from "../services/dashboard-organizer/get-organizer-events.service";

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
