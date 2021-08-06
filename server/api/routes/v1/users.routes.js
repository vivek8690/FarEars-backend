const express = require("express");
const router = express.Router();
const { isUserVerified } = require("../../middlewares/users.middleware");
const {
  registerUser,
  login,
  verifyAccount,
  sendVerificationEmail,
  manageInvite,
  allUsers,
  updateUserProfilePicture,
  fetchUserById,
  updateUserById,
} = require("../../controllers/users.controller");

const { validateUser } = require("../../middlewares");

router.get("/", allUsers);

router.post("/register", registerUser);

router.post("/send-verification-email", isUserVerified, sendVerificationEmail);

router.post("/login", login);

router.post("/upload", validateUser, updateUserProfilePicture);
router.patch("/:id", validateUser, updateUserById);
router.get("/:id", validateUser, fetchUserById);
router.post("/verify-account", verifyAccount);

module.exports = router;
