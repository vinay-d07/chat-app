const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  console.log(req.user);
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// @desc    Send Friend Request
// @route   POST /api/user/request/send
// @access  Protected
const sendFriendRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  const currentUserId = req.user._id;

  if (currentUserId.toString() === targetUserId) {
    res.status(400);
    throw new Error("You cannot send a friend request to yourself.");
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Ensure friends and sentRequests lists exist
  const currentFriends = currentUser.friends || [];
  const currentSent = currentUser.sentRequests || [];

  // These are arrays of ObjectId, so compare by string value, not by
  // reference (Array.includes on ObjectIds vs. a string never matches).
  if (currentFriends.some((id) => id.toString() === targetUserId)) {
    res.status(400);
    throw new Error("You are already friends with this user.");
  }

  if (currentSent.some((id) => id.toString() === targetUserId)) {
    res.status(400);
    throw new Error("Friend request already sent.");
  }

  await User.findByIdAndUpdate(targetUserId, {
    $addToSet: { receivedRequests: currentUserId },
  });
  await User.findByIdAndUpdate(currentUserId, {
    $addToSet: { sentRequests: targetUserId },
  });

  res.status(200).json({ message: "Friend request sent successfully." });
});

// @desc    Accept Friend Request
// @route   POST /api/user/request/accept
// @access  Protected
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { senderUserId } = req.body;
  const currentUserId = req.user._id;

  const senderUser = await User.findById(senderUserId);
  const currentUser = await User.findById(currentUserId);

  if (!senderUser) {
    res.status(404);
    throw new Error("User not found.");
  }

  const currentReceived = currentUser.receivedRequests || [];
  if (!currentReceived.some((id) => id.toString() === senderUserId)) {
    res.status(400);
    throw new Error("No friend request received from this user.");
  }

  // Remove from requests, add to friends list for both
  await User.findByIdAndUpdate(currentUserId, {
    $pull: { receivedRequests: senderUserId },
    $addToSet: { friends: senderUserId },
  });

  await User.findByIdAndUpdate(senderUserId, {
    $pull: { sentRequests: currentUserId },
    $addToSet: { friends: currentUserId },
  });

  // Becoming friends should immediately open a chat, so it shows up
  // in both users' chat lists without a separate "start chat" step.
  const existingChat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: currentUserId } } },
      { users: { $elemMatch: { $eq: senderUserId } } },
    ],
  });

  if (!existingChat) {
    await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [currentUserId, senderUserId],
    });
  }

  res.status(200).json({ message: "Friend request accepted." });
});

// @desc    Decline Friend Request
// @route   POST /api/user/request/decline
// @access  Protected
const declineFriendRequest = asyncHandler(async (req, res) => {
  const { senderUserId } = req.body;
  const currentUserId = req.user._id;

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { receivedRequests: senderUserId },
  });

  await User.findByIdAndUpdate(senderUserId, {
    $pull: { sentRequests: currentUserId },
  });

  res.status(200).json({ message: "Friend request declined." });
});

// @desc    Get Pending Requests (incoming & outgoing)
// @route   GET /api/user/request/pending
// @access  Protected
const getPendingRequests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("receivedRequests", "name email pic")
    .populate("sentRequests", "name email pic");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    received: user.receivedRequests || [],
    sent: user.sentRequests || [],
  });
});

// @desc    Get Friends List
// @route   GET /api/user/friends
// @access  Protected
const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("friends", "name email pic publicKey");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user.friends || []);
});

// @desc    Publish/update the caller's E2E encryption public key
// @route   PUT /api/user/publickey
// @access  Protected
const updatePublicKey = asyncHandler(async (req, res) => {
  const { publicKey } = req.body;

  if (!publicKey || typeof publicKey !== "string") {
    res.status(400);
    throw new Error("publicKey is required.");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { publicKey },
    { new: true }
  ).select("-password");

  res.status(200).json(user);
});

module.exports = {
  allUsers,
  registerUser,
  authUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingRequests,
  getFriends,
  updatePublicKey,
};
