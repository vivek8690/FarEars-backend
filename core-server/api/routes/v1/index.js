const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const userRoute = require("../v1/users.routes");
const inviteRoute = require("../v1/invite.routes");
const friendRoute = require("../v1/friends.routes");
const notificationRoute = require("../v1/notification.routes");
const forceUpdateVersion = '1.0.2';

const { emailServiceStatus, mongoDBStatus } = require("../../services");

router.get("/status", async (req, res) => {
  const mailServerStatus = await emailServiceStatus();
  const mongoDBStatusMessage = mongoDBStatus();
  return res.status(200).send({
    version: process.env.VERSION,
    mongo: mongoDBStatusMessage,
    mailService: mailServerStatus,
  });
});

router.get("/version", async (req, res) => {
  return res
    .status(200)
    .json({ message: "Force update version", version: forceUpdateVersion });
});

router.use("/users", userRoute);
router.use("/invite", inviteRoute);
router.use("/friends", friendRoute);
router.use("/notification", notificationRoute);

module.exports = router;
