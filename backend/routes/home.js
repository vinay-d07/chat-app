const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
  res.json({ msg: "home" });
});
module.exports = router;
