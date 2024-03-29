const express = require("express");
const expressip = require('express-ip');
const router = express.Router();
const { isUserVerified } = require("../../middlewares/users.middleware");
const upload = require("../../middlewares/upload");
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
  forgotPasswordVerify,
  loginWithGoogle,
  updateUserProfile,
  logout
} = require("../../controllers/users.controller");

const { validateUser } = require("../../middlewares");

router.get("/", allUsers);

router.post("/register", registerUser);
router.post("/forgot-password", forgotPasswordOTP);
router.post("/forgot-password-verify", forgotPasswordVerify);

router.post("/send-verification-email", isUserVerified, sendVerificationEmail);

router.post("/login",expressip().getIpInfoMiddleware, login);
router.post("/login-with-google",expressip().getIpInfoMiddleware, loginWithGoogle);
// this will be used
router.post("/uploadProfile", validateUser,upload.single('avatar'), updateUserProfile);
router.patch("/changePassword", validateUser, changePassword);

router.patch("/:id", validateUser, updateUserById);
router.get("/:id", validateUser, fetchUserById);
router.post("/verify-account", verifyAccount);
router.get("/extension/:id", fetchUserByExtension);
router.post("/logout", validateUser, logout);

module.exports = router;
