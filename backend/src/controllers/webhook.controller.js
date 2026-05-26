import { Webhook } from "svix";
import { db } from "../db/db.js";
import { upsertClerkUser } from "./user.controller.js";

export const handleClerkWebhook = async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: "Missing CLERK_WEBHOOK_SECRET" });
  }

  const headers = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"],
  };

  let event;

  try {
    const payload = req.body.toString("utf8");
    event = new Webhook(webhookSecret).verify(payload, headers);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertClerkUser(event.data);
    }

    if (event.type === "user.deleted") {
      await db.query("DELETE FROM users WHERE id = $1", [event.data.id]);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Clerk webhook handler failed:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};
