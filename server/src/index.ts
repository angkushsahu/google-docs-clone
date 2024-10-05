import { config } from "dotenv";
config();

const port = Number(process.env.PORT) ?? 8080;

import { Server } from "socket.io";
const io = new Server(port, {
   cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
   },
});

io.on("connection", (socket) => {
   socket.on("get-document", (documentId) => {
      socket.join(documentId);
      socket.emit("load-document", "");

      socket.on("send-changes", (delta: unknown) => {
         socket.broadcast.to(documentId).emit("receive-changes", delta);
      });
   });
});
