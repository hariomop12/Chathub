import { db } from "../db/db.js";

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const result = await db.query(
      `SELECT m.*, u.username, u.avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    const result = await db.query(
      `INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [chatId, req.userId, content]
    );

    const message = await db.query(
      `SELECT m.*, u.username, u.avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(message.rows[0]);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
