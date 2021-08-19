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
  fetchUserByExtension,
  changePassword,
  forgotPasswordOTP,
  forgotPasswordVerify
} = require("../../controllers/users.controller");

const { validateUser } = require("../../middlewares");

router.get("/", allUsers);

router.post("/register", registerUser);
router.post("/forgot-password", forgotPasswordOTP);
router.post("/forgot-password-verify", forgotPasswordVerify);



router.post("/send-verification-email", isUserVerified, sendVerificationEmail);

router.post("/login", login);

router.post("/upload", validateUser, updateUserProfilePicture);
router.patch("/changePassword", validateUser, changePassword);

router.patch("/:id", validateUser, updateUserById);
router.get("/:id", validateUser, fetchUserById);
router.post("/verify-account", verifyAccount);
router.get("/extension/:id", fetchUserByExtension);

module.exports = router;
