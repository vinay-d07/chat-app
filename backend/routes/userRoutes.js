const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingRequests,
  getFriends,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

// Friend operations routes
router.route("/request/send").post(protect, sendFriendRequest);
router.route("/request/accept").post(protect, acceptFriendRequest);
router.route("/request/decline").post(protect, declineFriendRequest);
router.route("/request/pending").get(protect, getPendingRequests);
router.route("/friends").get(protect, getFriends);

module.exports = router;
