import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { errorHandler, notFound } from "./middleware/error";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;