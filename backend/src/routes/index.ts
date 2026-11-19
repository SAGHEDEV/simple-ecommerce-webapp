import { Router } from "express";
import * as products from "../controllers/product.controller";
import * as currencies from "../controllers/currency.controller";
import { authRoutes } from "./auth.routes";
import { orderRoutes } from "./order.routes";
import { productRoutes } from "./product.routes";

export const apiRouter = Router();
apiRouter.get("/categories", products.getCategories);
apiRouter.get("/currencies", currencies.list);
apiRouter.use("/products", productRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/orders", orderRoutes);
