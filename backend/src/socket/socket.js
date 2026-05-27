import { db } from "../db/db.js";

const activeUsers = new Map();
const peerMap = new Map();

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

    socket.on("register-user", (userId) => {
      if (userId) {
        activeUsers.set(userId, socket.id);
        socket.data.userId = userId;
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    });

    socket.on("register-peer", ({ userId, peerId }) => {
      if (userId && peerId) {
        peerMap.set(userId, peerId);
        console.log(`Peer registered: user=${userId} peer=${peerId}`);
      }
    });

    socket.on("get-peer-id", ({ targetUserId }, callback) => {
      const peerId = peerMap.get(targetUserId) || null;
      if (callback) callback({ peerId });
    });

    socket.on("call-user", ({ targetUserId, callerId, callerUsername, callerAvatar, isVideo }) => {
      const targetSocketId = activeUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", {
          callerId,
          callerUsername,
          callerAvatar,
          isVideo,
        });
      } else {
        socket.emit("user-busy", { targetUserId });
      }
    });

    socket.on("call-answered", ({ targetUserId }) => {
      const targetSocketId = activeUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-answered");
      }
    });

    socket.on("call-rejected", ({ targetUserId }) => {
      const targetSocketId = activeUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-rejected");
      }
    });

    socket.on("end-call", ({ targetUserId }) => {
      const targetSocketId = activeUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.data.userId) {
        activeUsers.delete(socket.data.userId);
        peerMap.delete(socket.data.userId);
      }
    });
  });
};
