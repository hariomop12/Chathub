import { Router } from "express";
import { handleClerkWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/clerk", handleClerkWebhook);

export default router;
