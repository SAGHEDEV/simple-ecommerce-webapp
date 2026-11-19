import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4010),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  // FRONTEND_URL may be a comma-separated list of allowed origins.
  frontendUrls: (process.env.FRONTEND_URL ?? "http://localhost:5173").split(",").map((u) => u.trim()),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "furniro",
  },
  deliveryDelayMs: Number(process.env.DELIVERY_DELAY_MINUTES ?? 3) * 60_000,
};
