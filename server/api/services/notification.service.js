const { admin } = require("../../config/firebase");
let notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24, // in seconds
};

const sendPushNotification = async (registrationToken, message, expiry) => {
  if (expiry) {
    notification_options = { ...notification_options, timeToLive: expiry };
  }
  return admin
    .messaging()
    .sendToDevice(registrationToken, message, notification_options);
};

module.exports = { sendPushNotification };
