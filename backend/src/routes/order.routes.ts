import { Router } from "express";
import * as c from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth";

export const orderRoutes = Router();
orderRoutes.use(requireAuth);
orderRoutes.post("/", c.create);
orderRoutes.get("/", c.list);
orderRoutes.get("/:id", c.get);
orderRoutes.post("/:id/pay", c.pay);
