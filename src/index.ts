import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
// import sampleRouter from "./routes/sample.router";
import cors from "cors";
import eventRouter from "./routes/event.router";
const app = express();

app.use(cors());
app.use(express.json());

// app.use("/samples", sampleRouter);
app.use("/events", eventRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on port : ${PORT}`);
});
