const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  connectionStateRecovery: {},
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});


const socketHanler = require("./socket");
socketHanler(io);

const AuthToken = require("./middleware/authtoken");

 const cors = require("cors");


app.use(cors());

app.use(express.json());

app.get("/home", (req, res) => {
  // console.log(" home ");
  res.json("home");
});

const demoRoter = require("./routes/home");
app.use("/api/v1", AuthToken, demoRoter);

const ChatRouter = require("./routes/Chat");

app.use("/chat", AuthToken, ChatRouter);
const AuthRouer = require("./routes/Auth");

app.use("/auth", AuthRouer);

server.listen(8080, () => {
  console.log("everything's fine ");
});
