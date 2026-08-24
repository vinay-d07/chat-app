const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

// Tracks who is currently on a call with whom (userId -> peerUserId),
// so a dropped connection only ends the call for the actual peer.
const activeCallPeers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  let setupUserId;

  socket.on("setup", (userData) => {
    setupUserId = userData._id;
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // --------------------------video call signaling------------------------------
  // Callers/callees are addressed by the user-id rooms joined in "setup" above.

  socket.on("call:user", ({ to, from, offer, callType }) => {
    socket.in(to).emit("call:incoming", { from, offer, callType });
  });

  socket.on("call:answer", ({ to, answer }) => {
    if (setupUserId) {
      activeCallPeers.set(setupUserId, to);
      activeCallPeers.set(to, setupUserId);
    }
    socket.in(to).emit("call:answer", { answer });
  });

  socket.on("call:ice-candidate", ({ to, candidate }) => {
    socket.in(to).emit("call:ice-candidate", { candidate });
  });

  socket.on("call:reject", ({ to }) => {
    socket.in(to).emit("call:rejected");
  });

  socket.on("call:end", ({ to }) => {
    activeCallPeers.delete(setupUserId);
    activeCallPeers.delete(to);
    socket.in(to).emit("call:ended");
  });

  // --------------------------video call signaling------------------------------

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    if (setupUserId) {
      socket.leave(setupUserId);
      const peerId = activeCallPeers.get(setupUserId);
      if (peerId) {
        activeCallPeers.delete(setupUserId);
        activeCallPeers.delete(peerId);
        socket.in(peerId).emit("call:ended");
      }
    }
  });
});
