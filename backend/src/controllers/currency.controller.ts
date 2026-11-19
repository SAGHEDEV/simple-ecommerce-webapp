import type { Request, Response } from "express";
import { BASE_CURRENCY, CURRENCIES, getRates } from "../services/currency.service";

export const list = async (_req: Request, res: Response) => {
  res.json({
    base: BASE_CURRENCY,
    currencies: Object.entries(CURRENCIES).map(([code, name]) => ({ code, name })),
    rates: await getRates(),
  });
};
