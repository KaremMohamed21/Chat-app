const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const { createServer } = require("http");
const {
  addUser,
  getUsersInRoom,
  removeUser,
  getUser,
} = require("./controller");
const router = require("./router");

// Setup the server and the socket
const app = express();
const server = createServer(app);
const io = socketio(server);

// Setup cors
app.use(cors());

// Create the socket
io.on("connect", (socket) => {
  // on Join event
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // on Send Message event
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  // on Disconnect event
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// Setup the router
app.use(router);

// Setup port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running - ${PORT}`));
