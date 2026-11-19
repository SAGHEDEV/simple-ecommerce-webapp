import { z } from "zod";

export const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(5, "Phone number is required"),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State / region is required"),
  postalCode: z.string().trim().optional().default(""),
  country: z.string().trim().min(1, "Country is required"),
});

export const createOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your cart is empty"),
  shipping: shippingSchema,
  currency: z.string().trim().toUpperCase().length(3).optional().default("USD"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
