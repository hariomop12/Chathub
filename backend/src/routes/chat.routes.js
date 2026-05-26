import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getChats,
  createChat,
  getChatById,
  deleteDirectChat,
} from "../controllers/chat.controller.js";

const router = Router();

router.get("/", requireAuth, getChats);
router.post("/", requireAuth, createChat);
router.get("/:chatId", requireAuth, getChatById);
router.delete("/:chatId", requireAuth, deleteDirectChat);

export default router;
