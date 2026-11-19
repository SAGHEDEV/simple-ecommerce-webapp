import type { Request, Response } from "express";
import * as orders from "../services/order.service";
import type { AuthedRequest } from "../middleware/auth";
import { parse } from "../validators";
import { createOrderSchema } from "../validators/order.validator";

const uid = (req: Request) => (req as AuthedRequest).userId;

export const create = async (req: Request, res: Response) => {
  res.status(201).json(await orders.createOrder(uid(req), parse(createOrderSchema, req.body)));
};

export const list = async (req: Request, res: Response) => {
  res.json({ orders: await orders.listOrders(uid(req)) });
};

export const get = async (req: Request, res: Response) => {
  res.json({ order: await orders.getOrder(uid(req), Number(req.params.id)) });
};

export const pay = async (req: Request, res: Response) => {
  res.json({ order: await orders.confirmPayment(uid(req), Number(req.params.id)) });
};
