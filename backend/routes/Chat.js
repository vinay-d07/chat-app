const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");
const updateChatController = require("../controller/updateChatController");
const User = require("../models/userModel");

router.post("/add/:sender", async (req, res) => {
  try {
    const { ID } = req.body;
    const sender = req.params.sender;
    
    const user = await userModel.findOne({ uid: sender });
    const friend = await userModel.findOne({ uid: ID });

    if (!user || !friend) {
      return res.status(404).json("User not found");
    }

    const isFriend = user.friends.some((f) => f.fuid === friend.uid);
    if (isFriend) {
      return res.status(400).json("ALREADY A FRIEND");
    }

    await user.updateOne({
      $push: { friends: { name: friend.name, fuid: friend.uid } },
    });
    await friend.updateOne({
      $push: { friends: { name: user.name, fuid: user.uid } },
    });

    return res.status(200).json("ADDED SUCCESSFULLY");
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

router.get("/:sender/friends", async (req, res) => {
  const sender = req.params.sender;

  try {
    const user = await userModel.findOne({ uid: sender });
    if (user) {
      res.status(200).json(user.friends);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:sender/:reciever", async (req, res) => {
  const { sender, reciever } = req.params;
  if (!sender && !reciever) {
    return res.status(404).json({ msg: "start a coverstation" });
  }
  try {
    const result = await userModel.aggregate([
      {
        $match: { uid: sender },
      },
      {
        $project: {
          friendMsgs: {
            $getField: {
              field: "msgs",
              input: {
                $first: {
                  $filter: {
                    input: "$friends",
                    as: "friend",
                    cond: { $eq: ["$$friend.fuid", reciever] },
                  },
                },
              },
            },
          },
        },
      },
    ]);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

router.put("/:sender/:receiver", updateChatController);

router.delete("/:sender/:receiver/:msgid", async (req, res) => {
  const { sender, receiver, msgid } = req.params;
  console.log(sender, receiver, msgid);

  if (!sender || !receiver || !msgid) {
    return res.status(400).json({ msg: "Missing parameters" });
  }

  try {
    const result = await User.updateOne(
      {
        uid: sender,
        "friends.fuid": receiver,
        "friends.msgs._id": msgid,
      },
      {
        $pull: {
          "friends.$.msgs": { _id: msgid },
        },
      }
    )
    const result2 = await User.updateOne(
      {
        uid: receiver,
        "friends.fuid": sender,
        "friends.msgs._id": msgid,
      },
      {
        $pull: {
          "friends.$.msgs": { _id: msgid },
        },
      }
    )

    if (result.modifiedCount === 0 || result2.modifiedCount === 0) {
      return res.status(404).json({ msg: "Message not found" });
    }

    return res.status(200).json({ msg: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
