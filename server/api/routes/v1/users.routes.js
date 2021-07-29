const express = require("express");
const router = express.Router();
const { isUserVerified } = require("../../middlewares/users.middleware");
const {
  registerUser,
  login,
  verifyAccount,
  sendVerificationEmail,
  manageInvite,
  allUsers
} = require("../../controllers/users.controller");

const { validateUser } = require("../../middlewares");

router.get('/', allUsers);

router.post("/register", registerUser);

router.post("/login", login);

router.post(
  "/send-verification-email",
  isUserVerified,
  sendVerificationEmail
);

router.post("/verify-account", verifyAccount);

module.exports = router;
