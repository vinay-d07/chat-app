const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://vinay-d02:9449531911@cluster0.r1szo.mongodb.net/chat")
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log("Connection Error:", e));

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    uid: { type: String, unique: true, required: true },
    password: { type: String, unique: true, required: true },
    friends: [
      {
        name: String,
        fuid: String,
        msgs: [
          {
            text: String,
            time: { type: Date, default: Date.now },
            to: String,
            from: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
