const { admin } = require("../../config/firebase");
const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};

const sendPushNotification = async (registrationToken, message) => {
  return admin
    .messaging()
    .sendToDevice(registrationToken, message, notification_options);
};

module.exports = { sendPushNotification };
