import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifyToken } from "@clerk/express";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env"), quiet: true });

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);
app.use(express.json({ limit: "1mb" }));

app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      req.userId = payload.sub;
    } catch (err) {
      console.log("Auth error:", err.message);
    }
  }
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Chat API running...");
});

export default app;
