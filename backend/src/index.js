import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { PeerServer } from "peer";
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

const peerServer = PeerServer({
  port: 5001,
  path: "/",
  allow_discovery: true,
});

console.log("PeerJS server running on port 5001");

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
