import { db } from "../db/db.js";

export const getChats = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, cm2.last_message, cm2.last_message_at,
              other.other_user_id, other.other_username, other.other_avatar
       FROM chats c
       JOIN chat_members cm ON cm.chat_id = c.id
       LEFT JOIN LATERAL (
         SELECT content AS last_message, created_at AS last_message_at
         FROM messages
         WHERE chat_id = c.id
         ORDER BY created_at DESC
         LIMIT 1
       ) cm2 ON true
       LEFT JOIN LATERAL (
          SELECT u.id AS other_user_id, u.username AS other_username, u.avatar AS other_avatar
         FROM chat_members cmo
         JOIN users u ON u.id = cmo.user_id
         WHERE cmo.chat_id = c.id AND cmo.user_id != $1
         LIMIT 1
       ) other ON true
       WHERE cm.user_id = $1
       ORDER BY cm2.last_message_at DESC NULLS LAST`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getChats error:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export const createChat = async (req, res) => {
  try {
    const { participantIds, name } = req.body;

    if (!participantIds.includes(req.userId)) {
      participantIds.push(req.userId);
    }

    if (participantIds.length === 2) {
      const existing = await db.query(
        `SELECT c.* FROM chats c
         WHERE c.is_group = false
         AND EXISTS (
           SELECT 1 FROM chat_members WHERE chat_id = c.id AND user_id = $1
         )
         AND EXISTS (
           SELECT 1 FROM chat_members WHERE chat_id = c.id AND user_id = $2
         )`,
        [participantIds[0], participantIds[1]]
      );

      if (existing.rows.length > 0) {
        const fullChat = await db.query(
          `SELECT c.*, u.id AS other_user_id, u.username AS other_username, u.avatar AS other_avatar
           FROM chats c
           JOIN chat_members cm ON cm.chat_id = c.id
           JOIN users u ON u.id = cm.user_id
           WHERE c.id = $1 AND u.id != $2`,
          [existing.rows[0].id, req.userId]
        );
        return res.json(fullChat.rows[0]);
      }
    }

    const isGroup = participantIds.length > 2;

    const chat = await db.query(
      `INSERT INTO chats (name, is_group) VALUES ($1, $2) RETURNING *`,
    [name || null, isGroup]
    );

    const chatId = chat.rows[0].id;
    const values = participantIds.map((_, i) => `($1, $${i + 2})`).join(", ");
    const params = [chatId, ...participantIds];

    await db.query(
      `INSERT INTO chat_members (chat_id, user_id) VALUES ${values}`,
      params
    );

    const fullChat = await db.query(
      `SELECT c.*, u.id AS other_user_id, u.username AS other_username, u.avatar AS other_avatar
       FROM chats c
       JOIN chat_members cm ON cm.chat_id = c.id
       JOIN users u ON u.id = cm.user_id
       WHERE c.id = $1 AND u.id != $2`,
      [chatId, req.userId]
    );

    res.status(201).json(fullChat.rows[0]);
  } catch (err) {
    console.error("createChat error:", err);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await db.query(
      `SELECT c.*, u.id AS other_user_id, u.username AS other_username, u.avatar AS other_avatar
       FROM chats c
       JOIN chat_members cm ON cm.chat_id = c.id
       JOIN users u ON u.id = cm.user_id
       WHERE c.id = $1 AND u.id != $2`,
      [chatId, req.userId]
    );

    if (chat.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat.rows[0]);
  } catch (err) {
    console.error("getChatById error:", err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};

export const deleteDirectChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const result = await db.query(
      `DELETE FROM chats c
       WHERE c.id = $1
         AND c.is_group = false
         AND EXISTS (
           SELECT 1
           FROM chat_members cm
           WHERE cm.chat_id = c.id AND cm.user_id = $2
         )
       RETURNING c.id`,
      [chatId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Direct chat not found" });
    }

    res.json({ deleted: true, chatId: result.rows[0].id });
  } catch (err) {
    console.error("deleteDirectChat error:", err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};
