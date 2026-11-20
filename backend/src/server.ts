import app from "./app";
import { config } from "./config/env";
import { checkConnection } from "./config/db";

async function main() {
  try {
    await checkConnection();
  } catch (err) {
    const { host, port, user, database } = config.db;
    console.error(`Could not connect to MySQL (${user}@${host}:${port}/${database}): ${(err as Error).message}`);
    console.error("Check DB_* values in backend/.env and make sure the database exists (see README).");
    process.exit(1);
  }
  app.listen(config.port, () => console.log(`API on http://localhost:${config.port}`));
}

main();
