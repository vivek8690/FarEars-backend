const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middlewares");
const {
  sendPushNotification,
} = require("../../controllers/notification.controller");

router.post("/", validateUser, sendPushNotification);

module.exports = router;
