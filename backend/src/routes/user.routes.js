import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getUsers, searchUsers, upsertUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/", requireAuth, getUsers);
router.get("/search", requireAuth, searchUsers);
router.post("/", requireAuth, upsertUser);

export default router;
