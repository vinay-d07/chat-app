const express = require("express");
const upload = require("../config/multer");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(201).json({
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
  });
});

module.exports = router;
