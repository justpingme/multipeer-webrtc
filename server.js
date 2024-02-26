const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
app.use(express.static("public"));

const remoteStreams = {};

const log = (msg) => console.log("Info:", msg);

io.on("connection", (socket) => {
  log(`User connected, SocketId: ${socket.id}`);

  const emitToRoom = (event, data) =>
    socket.to(data.to).emit(event, { ...data, from: socket.id });

  socket.on("joinRoom", (room) => {
    remoteStreams[socket.id] = socket.id;
    socket.join(room);
    emitToRoom("newUserJoined", { socketId: socket.id, to: room });
  });

  socket.on("offer", (data) =>
    emitToRoom("onOffer", { offer: data.offer, to: data.to })
  );
  socket.on("answer", (data) =>
    emitToRoom("accepted", { answer: data.answer, to: data.to })
  );
  socket.on("iceCandidate", (data) =>
    emitToRoom("newIceCandidate", {
      iceCandidate: data.iceCandidate,
      to: data.to,
    })
  );

  socket.on("disconnect", () => {
    log(`User ${socket.id} disconnected`);
    if (remoteStreams[socket.id]) delete remoteStreams[socket.id];
    io.emit("onDisconnect", { socketId: socket.id });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => log(`Server is running on http://localhost:${PORT}`));
