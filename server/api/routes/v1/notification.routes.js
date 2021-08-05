const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middlewares");
const {
  sendNotification,
} = require("../../controllers/notification.controller");

router.post("/", sendNotification);

module.exports = router;
