import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import sampleRouter from "./routes/sample.router";
import authRouter from "./routes/auth.router";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/samples", sampleRouter);
app.use("/auth", authRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server listening on port : ${PORT}`);
});
