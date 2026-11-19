import type { Request, Response } from "express";
import * as products from "../services/product.service";

export const getCategories = (_req: Request, res: Response) => {
  res.json({ categories: products.CATEGORIES });
};

export const listProducts = async (req: Request, res: Response) => {
  const q = req.query;
  res.json(
    await products.listProducts({
      search: String(q.search ?? ""),
      category: String(q.category ?? ""),
      sort: String(q.sort ?? ""),
      page: Number(q.page),
      limit: Number(q.limit),
    }),
  );
};

export const getProduct = async (req: Request, res: Response) => {
  res.json({ product: await products.getProduct(Number(req.params.id)) });
};
