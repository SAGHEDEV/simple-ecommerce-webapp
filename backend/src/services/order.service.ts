import crypto from "node:crypto";
import { execute, query, queryOne, withTransaction } from "../config/db";
import { config } from "../config/env";
import { HttpError } from "../utils/httpError";
import type { CreateOrderInput } from "../validators/order.validator";
import { getRate } from "./currency.service";
import { getAllProducts } from "./product.service";

interface OrderRow {
  id: number; reference: string; status: "pending" | "paid" | "delivered"; total: number;
  currency: string; exchange_rate: number; created_at: Date; paid_at: Date | null;
  shipping_full_name: string; shipping_phone: string; shipping_address: string; shipping_city: string;
  shipping_state: string; shipping_postal: string; shipping_country: string;
}
interface ItemRow { order_id: number; productId: number; title: string; thumbnail: string; price: number; quantity: number }

async function serialize(rows: OrderRow[]) {
  if (!rows.length) return [];
  const items = await query<ItemRow>(
    "SELECT order_id, product_id AS productId, title, thumbnail, price, quantity FROM order_items WHERE order_id IN (?) ORDER BY id",
    [rows.map((r) => r.id)],
  );
  return rows.map((o) => ({
    id: o.id,
    reference: o.reference,
    status: o.status,
    total: o.total,
    currency: o.currency,
    exchangeRate: o.exchange_rate,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    shipping: {
      fullName: o.shipping_full_name, phone: o.shipping_phone, address: o.shipping_address, city: o.shipping_city,
      state: o.shipping_state, postalCode: o.shipping_postal, country: o.shipping_country,
    },
    items: items
      .filter((i) => i.order_id === o.id)
      .map(({ order_id: _omit, ...rest }) => rest),
  }));
}

/** No admin exists, so paid orders are auto-delivered after a delay to demonstrate the full status lifecycle. */
async function refreshDelivery(userId: number) {
  const cutoff = new Date(Date.now() - config.deliveryDelayMs);
  await execute("UPDATE orders SET status = 'delivered' WHERE user_id = ? AND status = 'paid' AND paid_at <= ?", [userId, cutoff]);
}

async function findOwned(orderId: number, userId: number) {
  const row = await queryOne<OrderRow>("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
  if (!row) throw new HttpError(404, "Order not found");
  return row;
}

export async function createOrder(userId: number, input: CreateOrderInput) {
  const catalog = new Map((await getAllProducts()).map((p) => [p.id, p]));
  const rate = await getRate(input.currency);

  // Prices and stock are always taken from the server-side catalog (USD), never from the client.
  const lines = input.items.map(({ productId, quantity }) => {
    const p = catalog.get(productId);
    if (!p) throw new HttpError(400, `Product ${productId} no longer exists`);
    if (p.stock < quantity) throw new HttpError(400, `Only ${p.stock} of "${p.title}" in stock`);
    return { p, quantity };
  });
  const total = Math.round(lines.reduce((s, l) => s + l.p.price * l.quantity, 0) * 100) / 100;
  const reference = "ord_" + crypto.randomBytes(8).toString("hex");
  const s = input.shipping;

  const orderId = await withTransaction(async (conn) => {
    const { insertId } = await execute(
      `INSERT INTO orders (user_id, reference, total, currency, exchange_rate,
         shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal, shipping_country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, reference, total, input.currency, rate, s.fullName, s.phone, s.address, s.city, s.state, s.postalCode, s.country],
      conn,
    );
    for (const l of lines) {
      await execute(
        "INSERT INTO order_items (order_id, product_id, title, thumbnail, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
        [insertId, l.p.id, l.p.title, l.p.thumbnail, l.p.price, l.quantity],
        conn,
      );
    }
    return insertId;
  });
  return { orderId, reference };
}

export async function listOrders(userId: number) {
  await refreshDelivery(userId);
  return serialize(await query<OrderRow>("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]));
}

export async function getOrder(userId: number, orderId: number) {
  await refreshDelivery(userId);
  return (await serialize([await findOwned(orderId, userId)]))[0];
}

/** The customer confirms they have paid (test payment step – no gateway involved). */
export async function confirmPayment(userId: number, orderId: number) {
  await findOwned(orderId, userId);
  await execute("UPDATE orders SET status = 'paid', paid_at = UTC_TIMESTAMP() WHERE id = ? AND user_id = ? AND status = 'pending'", [orderId, userId]);
  return (await serialize([await findOwned(orderId, userId)]))[0];
}
