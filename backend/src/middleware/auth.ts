import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth.service";

export interface AuthedRequest extends Request {
  userId: number;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  (req as AuthedRequest).userId = verifyToken(header.startsWith("Bearer ") ? header.slice(7) : "");
  next();
}
