import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/socket.js";
import { corsOrigin } from "./config/cors.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
