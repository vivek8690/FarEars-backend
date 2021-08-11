const axios = require("axios");
const axiosNoFail = axios.create({
  validateStatus: function (status) {
    return status < 500;
  },
});

const sendPushNotification = async (toUser, fromUser) => {
  try {
    console.log(`${fromUser.first_name} ${fromUser.last_name} sending you PTT`);
    const body = {
      deviceToken: toUser.deviceToken,
      message: {
        data: {
          type: "asterisk",
          details: `${fromUser.first_name} ${fromUser.last_name} sending you PTT`
        },
      },
    };
    await axios.post("http://localhost:3000/api/notification", body);
  } catch (err) {
    console.log(err);
  }
};

const sendNotificationByExt = async (toExt) => {
  try {
    const body = {
      extension: toExt,
      message: {
        data: {
          type: "asterisk",
          details: `Register in asterisk`
        },
      },
    };
    await axios.post("http://localhost:3000/api/notification/byExtension", body);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { sendPushNotification, sendNotificationByExt };
