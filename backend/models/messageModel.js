const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Legacy plaintext content, kept only for messages sent before E2E
    // encryption was added. New text messages use ciphertext/iv/keys below.
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    // E2E encryption: AES-GCM ciphertext of the message body, base64.
    ciphertext: { type: String },
    // Base64 AES-GCM IV used for `ciphertext`.
    iv: { type: String },
    // Per-recipient (incl. sender) wrapping of the random AES message key,
    // each encrypted via an ECDH-derived key between sender and that user.
    // The server only ever stores/relays these opaque blobs.
    keys: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        encryptedKey: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
