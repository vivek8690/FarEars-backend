const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middlewares");
const {
  sendNotification,
  sendNotificationByExt
} = require("../../controllers/notification.controller");

router.post("/", sendNotification);
router.post("/byExtension", sendNotificationByExt);

module.exports = router;
