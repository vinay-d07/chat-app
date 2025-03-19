const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
     
    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password, salt);

    const uid = Math.floor(1000 + Math.random() * 9000);

    const newUser = await userModel.create({
      email: email,
      name: name,
      uid: uid,
      password: hashedpass,
    });

    res.status(200).json({ msg: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ msg: "no user found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Incorrect credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({
        msg: "Successfully logged in",
        token: token,
        red_url: "/home",
        user: user,
      });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
