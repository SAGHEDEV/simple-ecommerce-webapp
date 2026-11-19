import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { execute, queryOne } from "../config/db";
import { config } from "../config/env";
import { HttpError } from "../utils/httpError";
import type { SigninInput, SignupInput } from "../validators/auth.validator";

export interface PublicUser { id: number; name: string; email: string }
interface UserRow extends PublicUser { password_hash: string }

export const signToken = (userId: number) => jwt.sign({ sub: String(userId) }, config.jwtSecret, { expiresIn: "7d" });

/** Returns the user id encoded in the token, or throws 401. */
export function verifyToken(token: string): number {
  try {
    return Number((jwt.verify(token, config.jwtSecret) as { sub: string }).sub);
  } catch {
    throw new HttpError(401, "Please sign in to continue");
  }
}

export async function signUp({ name, email, password }: SignupInput) {
  if (await queryOne("SELECT id FROM users WHERE email = ?", [email]))
    throw new HttpError(409, "An account with this email already exists");
  const result = await execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [
    name,
    email,
    bcrypt.hashSync(password, 10),
  ]);
  const id = result.insertId;
  return { token: signToken(id), user: { id, name, email } as PublicUser };
}

export async function signIn({ email, password }: SigninInput) {
  const row = await queryOne<UserRow>("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email]);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) throw new HttpError(401, "Incorrect email or password");
  return { token: signToken(row.id), user: { id: row.id, name: row.name, email: row.email } as PublicUser };
}

export async function getUser(id: number): Promise<PublicUser> {
  const row = await queryOne<PublicUser>("SELECT id, name, email FROM users WHERE id = ?", [id]);
  if (!row) throw new HttpError(401, "Account not found");
  return row;
}
