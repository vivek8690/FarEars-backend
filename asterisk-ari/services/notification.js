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
          details: `${fromUser.first_name} ${fromUser.last_name} sending you PTT`,
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
      expiry: 5, // in seconds
      message: {
        data: {
          type: "asterisk",
          details: `Register in asterisk`,
        },
      },
    };
    await axios.post(
      "http://localhost:3000/api/notification/byExtension",
      body
    );
  } catch (err) {
    console.log(err);
  }
};

const sendMissedPTTNotification = async (toExt, callee) => {
  try {
    const message = {
      notification: {
        title: `You missed PTT from ${callee.first_name} ${callee.last_name}`,
      },
      data: {
        type: "missed_ptt",
      },
    };
    const body = {
      extension: toExt,
      message: message
    };
    await axios.post("http://localhost:3000/api/notification/byExtension", body);
  } catch (err) {
    console.log(err);
  }
};

const incomingPTTNotification = async (toExt, caller) => {
  try {
    const message = {
      notification: {
        title: `You missed PTT from ${caller.first_name} ${caller.last_name}`,
      },
      data: {
        type: "incoming_ptt",
      },
    };
    const body = {
      extension: toExt,
      message: message
    };
    await axios.post("http://localhost:3000/api/notification/byExtension", body);
  } catch (err) {
    console.log(err);
  }
};

const getExtensionDetails = async (toExt) => {
  try {
    const user = await axios.get(
      `http://localhost:3000/api/users/extension/${toExt}`
    );
    return user.data.data;
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  sendPushNotification,
  sendNotificationByExt,
  getExtensionDetails,
  sendMissedPTTNotification,
  incomingPTTNotification
};
