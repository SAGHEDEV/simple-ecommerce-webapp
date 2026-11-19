import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFound } from "./middleware/error";

export const app = express();

app.use(cors({ origin: config.frontendUrls }));
app.use(express.json());

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);
