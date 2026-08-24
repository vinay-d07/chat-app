const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email publicKey")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const {
    content,
    chatId,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    ciphertext,
    iv,
    keys,
  } = req.body;

  if ((!content && !fileUrl && !ciphertext) || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    chat: chatId,
    // E2E-encrypted text takes priority; `content` is only accepted as a
    // legacy plaintext fallback (e.g. an old client that hasn't updated).
    ...(ciphertext ? { ciphertext, iv, keys } : content && { content }),
    ...(fileUrl && { fileUrl, fileName, fileType, fileSize }),
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic publicKey").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email publicKey",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
