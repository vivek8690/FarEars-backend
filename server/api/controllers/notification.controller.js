const APIError = require("../utils/APIError");
const { admin } = require("../../config/firebase");
const { sendPushNotification } = require("../services/notification.service");

const sendNotification = async (req, res, next) => {
  try {
    const registrationToken = req.body.deviceToken;
    console.log(req.body);
    const message = req.body.message;
    await sendPushNotification(registrationToken, message);
    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendNotification };
