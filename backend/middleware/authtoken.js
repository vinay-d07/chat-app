const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const AuthToken = (req, res, next) => {
  console.log(process.env.JWT_SECRET)
  try {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    
    const decode = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
   
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Unauthorized: Invalid token" });
  }
};

module.exports = AuthToken;
