// const logger = require('../../config/logger');

const {
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  EMAIL_SERVICE_PORT,
  EMAIL_SERVICE_USER,
  EMAIL_SERVICE_PASS,
  EMAIL_SERVICE_HOST,
  EMAIL_SERVICE_FROM_EMAIL,
} = process.env;

const twilioClient = require("twilio")(TWILIO_SID, TWILIO_AUTH_TOKEN);
const mongoose = require("mongoose");
const nodeMailer = require("nodemailer");

const smtpTransporter = nodeMailer.createTransport({
  host: EMAIL_SERVICE_HOST,
  port: EMAIL_SERVICE_PORT,
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_SERVICE_USER, // your gmail email adress
    pass: EMAIL_SERVICE_PASS, // your gmail password
  },
});

const sendSMS = async (message, mobileNumber) => {
  let messageResp = await twilioClient.messages.create({
    body: message,
    messagingServiceSid: TWILIO_SID,
    to: mobileNumber,
  });
  return messageResp;
};

const sendEmail = async (email) => {
  const emailObject = {
    from: EMAIL_SERVICE_FROM_EMAIL,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  };
  let emailResp = await smtpTransporter.sendMail(emailObject);
  return emailResp;
};

const emailServiceStatus = async () => {
  let isRunning = true;
  try {
    await smtpTransporter.verify();
  } catch (error) {
    isRunning = false;
  } finally {
    return isRunning
      ? "Mail Service Running Fine"
      : "There is some issue in Email Service";
  }
};

const mongoDBStatus = () => {
  const mongoState = mongoose.connection.readyState;
  let mongoStatusMessage = "Getting MongoDB Status";
  if (mongoState == 0) {
    mongoStatusMessage = "MongoDB is not connected.";
  } else if (mongoState == 1) {
    mongoStatusMessage = "MongoDB is connected.";
  } else if (mongoState == 2) {
    mongoStatusMessage = "MongoDB is connecting.";
  } else if (mongoState == 1) {
    mongoStatusMessage = "MongoDB is disconnecting.";
  }
  return mongoStatusMessage;
};

module.exports = {
  sendSMS,
  sendEmail,
  emailServiceStatus,
  mongoDBStatus,
};
