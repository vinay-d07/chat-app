let online = {};
const sendOfflline = require("./controller/sendOffline");
const socketHanler = (io) => {
  io.on("connection", (socket) => {
    const { myID } = socket.handshake.query;

    online[myID] = socket.id;

    socket.emit("connected");

    socket.on("chat-message", async ({ msg, fuid }) => {
      console.log("Received:", msg, "for:", fuid);

      if (online[fuid]) {
        io.to(online[fuid]).emit("chat-message-sent", msg);
        console.log("Message sent in real-time to:", fuid);
        const saveStatus = await sendOfflline(myID, fuid, msg);
      } else {
        console.log("Receiver is offline, message saved for later");
        // const saveStatus = await sendOfflline(myID, fuid, msg);
      }
    });

    io.emit("get-online", onlineUsers);

    socket.on("disconnect", () => {
      console.log("disconnected:", myID);
      delete online[myID];
    });
  });
};

module.exports = socketHanler;
