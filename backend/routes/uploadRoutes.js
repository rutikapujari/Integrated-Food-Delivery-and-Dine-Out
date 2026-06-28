const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const authorize = require("../middleware/role");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

router.post(
  "/",
  auth,
  authorize("customer", "restaurant", "admin"),
  upload.single("image"),
  uploadImage
);

module.exports = router;
