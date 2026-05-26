import { db } from "../db/db.js";


export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (chatId) => {
      socket.join(chatId);
      console.log(`${socket.id} joined room ${chatId}`);
    });

    socket.on("leave-room", (chatId) => {
      socket.leave(chatId);
    });

    socket.on("typing", ({ chatId, userId, username }) => {
      socket.to(chatId).emit("user-typing", { chatId, userId, username });
    });

    socket.on("stop-typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("user-stop-typing", { chatId, userId });
    });

    socket.on("send-message", async (data) => {
      try {
        const { chatId, senderId, content, fileUrl, fileName, fileType, fileSize } = data;

        const result = await db.query(
          `INSERT INTO messages (chat_id, sender_id, content, file_url, file_name, file_type, file_size)
           VALUES ($1, $2, COALESCE($3, ''), $4, $5, $6, $7) RETURNING *`,
          [chatId, senderId, content, fileUrl || null, fileName || null, fileType || null, fileSize || null]
        );

        const message = await db.query(
          `SELECT m.*, u.username, u.avatar
           FROM messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.id = $1`,
          [result.rows[0].id]
        );

        io.to(chatId).emit("receive-message", message.rows[0]);
      } catch (err) {
        console.error("send-message error:", err);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
