import { HttpError } from "../utils/httpError";

/** Product prices are stored/returned in this base currency. */
export const BASE_CURRENCY = "USD";

export const CURRENCIES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  NGN: "Nigerian Naira",
  GHS: "Ghanaian Cedi",
  KES: "Kenyan Shilling",
  ZAR: "South African Rand",
  CAD: "Canadian Dollar",
  INR: "Indian Rupee",
};

// Approximate rates used only if the live rates API is unreachable and nothing is cached yet.
const FALLBACK: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, GHS: 15, KES: 129, ZAR: 18.5, CAD: 1.37, INR: 83 };

let cache: { at: number; rates: Record<string, number> } | null = null;
const TTL = 12 * 60 * 60 * 1000;

/** Live rates from the free open.er-api.com service (no key), cached for 12h. */
export async function getRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.at < TTL) return cache.rates;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`);
    if (!res.ok) throw new Error(`rates API ${res.status}`);
    const data = (await res.json()) as { rates: Record<string, number> };
    const rates: Record<string, number> = {};
    for (const code of Object.keys(CURRENCIES)) rates[code] = data.rates[code] ?? FALLBACK[code];
    cache = { at: Date.now(), rates };
  } catch {
    if (!cache) cache = { at: Date.now() - TTL + 5 * 60 * 1000, rates: FALLBACK }; // retry in 5 min
  }
  return cache!.rates;
}

export async function getRate(code: string): Promise<number> {
  const rates = await getRates();
  if (!(code in rates)) throw new HttpError(400, `Unsupported currency: ${code}`);
  return rates[code];
}
