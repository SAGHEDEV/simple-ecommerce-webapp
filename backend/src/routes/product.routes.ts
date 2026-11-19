import { Router } from "express";
import * as c from "../controllers/product.controller";

export const productRoutes = Router();
productRoutes.get("/", c.listProducts);
productRoutes.get("/:id", c.getProduct);
