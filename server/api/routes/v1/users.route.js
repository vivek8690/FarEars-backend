const express = require("express");
const router = express.Router();

const {
  registerUser,
  login,
  verifyAccount,
  sendVerificationEmail,
  checkUserVerified,
  inviteUser,
  manageInvite,
} = require("../../controllers/users.controller");

const { validateUser } = require("../../middlewares");

router.post("/register", registerUser);

router.post("/login", login);

router.post(
  "/send-verification-email",
  checkUserVerified,
  sendVerificationEmail
);

router.post("/verify-account", verifyAccount);

router.post("/invite-user", validateUser, inviteUser);

router.post("/manage-invite", validateUser, manageInvite);

module.exports = router;
