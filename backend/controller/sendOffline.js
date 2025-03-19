const userModel = require("../models/userModel");

const sendOfflline = async (myID, fuid, msg) => {
  try {
    const newMessage = {
      text: msg,
      time: new Date(),
      to: fuid,
      from: myID,
    };

    // Update myID's messages
    const myIDResult = await userModel.updateOne(
      { uid: myID, "friends.fuid": fuid },
      {
        $push: {
          "friends.$.msgs": newMessage,
        },
      }
    );

    // Update fuid's messages
    const receiverResult = await userModel.updateOne(
      { uid: fuid, "friends.fuid": myID },
      {
        $push: {
          "friends.$.msgs": newMessage,
        },
      }
    );

    // Check if both updates were successful
    if (myIDResult.matchedCount === 0 || receiverResult.matchedCount === 0) {
      return "User or friend not found" 
    }

    return "Message added successfully!" 
  } catch (error) {
    console.error(error);
    return "Internal Server Error" 
  }
};

module.exports = sendOfflline;
