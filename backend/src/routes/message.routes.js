import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/:chatId", requireAuth, getMessages);
router.post("/:chatId", requireAuth, sendMessage);

export default router;
