import type { Request, Response } from "express";
import * as auth from "../services/auth.service";
import type { AuthedRequest } from "../middleware/auth";
import { parse } from "../validators";
import { signinSchema, signupSchema } from "../validators/auth.validator";

export const signUp = async (req: Request, res: Response) => {
  res.status(201).json(await auth.signUp(parse(signupSchema, req.body)));
};

export const signIn = async (req: Request, res: Response) => {
  res.json(await auth.signIn(parse(signinSchema, req.body)));
};

export const me = async (req: Request, res: Response) => {
  res.json({ user: await auth.getUser((req as AuthedRequest).userId) });
};
