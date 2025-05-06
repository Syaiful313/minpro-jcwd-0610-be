import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import sampleRouter from "./routes/sample.router";
import authRouter from "./routes/auth.router";
import cors from "cors";
import eventRouter from "./routes/event.router";
import profileRouter from "./routes/profile.router";
import referralRouter from "./routes/referral.router";
import couponRouter from "./routes/coupon.router";
import dashboardEventRouter from "./routes/dashboard-organizer.router";
import adminRouter from "./routes/admin.router";
import transactionRouter from "./routes/transaction.router";
import "./scripts/pointsExpiryScheduler";
import startTransactionExpirationJob from "./utils/scheduler";

const app = express();

startTransactionExpirationJob();

app.use(cors());
app.use(express.json());

app.use("/events", eventRouter);
app.use("/samples", sampleRouter);
app.use("/auth", authRouter);
app.use("/profiles", profileRouter);
app.use("/referrals", referralRouter);
app.use("/coupons", couponRouter);
app.use("/organizer/events", dashboardEventRouter);
app.use("/admin", adminRouter);
app.use("/transactions",transactionRouter );

app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`Server listening on port : ${PORT}`);
});
