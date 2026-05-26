import pkg from "pg";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env"), quiet: true });

const { Pool } = pkg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.connect()
  .then((client) => {
    client.release();
    console.log("Postgres connected");
  })
  .catch((err) => console.log("DB Error:", err));
