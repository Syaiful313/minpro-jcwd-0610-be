import { NextFunction, Request, Response } from "express";
import { getEventsService } from "../services/event/get-events.service";
import { getEventBySlugService } from "../services/event/get-event-by-slug.service";

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