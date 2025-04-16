import { Router } from "express";
import { getEventBySlugController, getEventsController } from "../controllers/event.controller";


const router = Router();

router.get("/", getEventsController);
router.get("/:slug", getEventBySlugController);


export default router;
