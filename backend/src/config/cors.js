const DEFAULT_CLIENT_URL = "http://localhost:5173";

export const allowedOrigins = (process.env.CLIENT_URL || DEFAULT_CLIENT_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
}
