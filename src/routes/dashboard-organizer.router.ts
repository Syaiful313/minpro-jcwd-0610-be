// import { Router } from "express";
// import {
//   DeleteEventController,
//   getAttendeesByEventSlugController,
//   getOrganizerEventsController,
//   getOrganizerTransactionsController,
//   updateTransactionController,
// } from "../controllers/dashboard-organizer.controller";
// import { verifyToken } from "../lib/jwt";

// const router = Router();

// router.get("/", verifyToken, getOrganizerEventsController);
// router.get("/attendees/:slug", verifyToken, getAttendeesByEventSlugController);
// router.get("/transactions", verifyToken, getOrganizerTransactionsController);
// router.delete("/:id", verifyToken, DeleteEventController);
// router.patch("/update", verifyToken, updateTransactionController);

// export default router;
