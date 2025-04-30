import { Request, Response, NextFunction } from "express";
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
