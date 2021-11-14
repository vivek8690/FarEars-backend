const randomize = require("randomatic");

const { BCRYPT_SALT } = process.env;
const { OTPModel,Users } = require("../models");
const bcrypt = require("bcrypt");
const { sendEmail } = require("./");
const { getAllFriendsList } = require("./friends.service");
const { createExtension } = require("./asterisk");
const { sendPushNotification } = require("./notification.service");

const sendOTPEmail = async (email) => {
  try {
    const otp = randomize("000000");
    let emailStatus = await sendEmail({
      to: email,
      subject: "FarEars Account Verification",
      html: `OTP For Account Verification is ${otp}`,
      text: otp,
    });

    if (emailStatus.accepted && emailStatus.accepted.indexOf(email) == -1) {
      throw new Error("Technical error while sending email, please try again.");
    }

    const dataToHash = `${otp}${email}`;
    let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
    let hash = await bcrypt.hash(dataToHash, salt);

    await OTPModel.findOneAndUpdate(
      {
        email,
      },
      {
        otp: hash,
        email,
      },
      {
        new: true,
        upsert: true,
      }
    );
  } catch (err) {
    throw err;
  }
};

const broadcastUpdate = async (user) => {
  const friendsList = await getAllFriendsList(user);
  const registrationTokens = friendsList.map((user) => user.deviceToken);
  if (registrationTokens.length > 0) {
    const message = {
      data: {
        type: "user_updated",
        details: JSON.stringify(user),
      },
    };
    sendPushNotification(registrationTokens, message, 20);
  }
};

const saveUserDetails = async (user) => {
  try {
    let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
    let hashedPassword = await bcrypt.hash(user.password, salt);
    let newUser = new Users({
      ...user,
      is_verified: user.loginWith === 'google' ? true: false,
      password: hashedPassword,
    });
    newUser.extension = await createExtension(user.password);
    let userResp = await newUser.save();
    sendEmail({
      to: "farearsoneday@gmail.com",
      subject: `New user created`,
      text: `
      email: ${newUser.email}
      first name: ${newUser.first_name}
      last name: ${newUser.last_name}
      loginWith: ${newUser.loginWith}`,
    });
    return userResp;
  } catch (err) {
    throw err;
  }
};

module.exports = { sendOTPEmail, broadcastUpdate, saveUserDetails };
