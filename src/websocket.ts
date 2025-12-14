import { Server } from "socket.io";
import http from "http";

const port = Number(process.env.WS_PORT || 8080);

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("board", () => {
    io.emit("board", {});
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`WebSocket server listening on port ${port}`);
});
