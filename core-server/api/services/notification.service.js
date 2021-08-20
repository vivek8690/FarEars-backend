const { admin } = require("../../config/firebase");

const sendPushNotification = async (registrationToken, message, expiry) => {
  let notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24, // in seconds
  };

  if (expiry) {
    notification_options = { ...notification_options, timeToLive: expiry };
  }
  console.log("expiry:::::",  expiry);
  console.log(notification_options);
  return admin
    .messaging()
    .sendToDevice(registrationToken, message, notification_options);
};

module.exports = { sendPushNotification };
