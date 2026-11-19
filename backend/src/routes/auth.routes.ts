import { Router } from "express";
import * as c from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

export const authRoutes = Router();
authRoutes.post("/signup", c.signUp);
authRoutes.post("/signin", c.signIn);
authRoutes.get("/me", requireAuth, c.me);
