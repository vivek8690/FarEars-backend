const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const userRoute = require("../v1/users.route");
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

router.use("/users", userRoute);
module.exports = router;
