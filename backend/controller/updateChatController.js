const userModel=require('../models/userModel')


const updateChatController=async (req, res) => {
    const { sender, receiver } = req.params;

    if (!sender || !receiver) {
      return res.status(400).json({ msg: "Sender and receiver are required" });
    }
  
    try {
        const newMessage = {
          text: req.body.text,
          time: new Date(),
          to: receiver,
          from: sender,
        };
    
        // Update sender's messages
        const senderResult = await userModel.updateOne(
          { uid: sender, "friends.fuid": receiver },
          {
            $push: {
              "friends.$.msgs": newMessage,
            },
          }
        );
    
        // Update receiver's messages
        const receiverResult = await userModel.updateOne(
          { uid: receiver, "friends.fuid": sender },
          {
            $push: {
              "friends.$.msgs": newMessage,
            },
          }
        );
    
        // Check if both updates were successful
        if (senderResult.matchedCount === 0 || receiverResult.matchedCount === 0) {
          return res.status(404).json({ message: "User or friend not found" });
        }
    
        res.status(200).json({ message: "Message added successfully!" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
  }
module.exports=updateChatController