const APIError = require("../utils/APIError");
const { admin } = require("../../config/firebase");

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};

const sendPushNotification = async (req, res, next) => {
  const registrationToken = req.user.deviceToken;
  console.log(req.body);
  const message = req.body.message;
  const options = notification_options;

  admin
    .messaging()
    .sendToDevice(registrationToken, message, options)
    .then((response) => {
      res.status(200).send("Notification sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = { sendPushNotification };
