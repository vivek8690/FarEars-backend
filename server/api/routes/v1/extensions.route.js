const express = require("express");

const router = express.Router();

const {
  validateUser,
  isUserVerified,
  uploadFile,
} = require("../../middlewares");
const {
  uploadExtensions,
  getExtensions,
} = require("../../controllers/extensions.controller");

router.post(
  "/csv",
  validateUser,
  isUserVerified,
  uploadFile.single("file"),
  uploadExtensions
);

router.get("/csv", validateUser, isUserVerified, getExtensions);

module.exports = router;
