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

  socket.on("board", (data: { boardId?: string }) => {
    if (data.boardId) {
      io.to(data.boardId).emit("board", data);
    } else {
      io.emit("board", data);
    }
  });

  socket.on("joinBoard", (boardId: string) => {
    socket.join(boardId);
    console.log(`Client joined board room: ${boardId}`);
  });

  socket.on("leaveBoard", (boardId: string) => {
    socket.leave(boardId);
    console.log(`Client left board room: ${boardId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`WebSocket server listening on port ${port}`);
});
