import type { ZodType } from "zod";
import { HttpError } from "../utils/httpError";

/** Parse `data` with a zod schema or throw a 400 with the first issue message. */
export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new HttpError(400, result.error.issues[0].message);
  return result.data;
}
