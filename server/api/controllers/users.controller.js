const { BCRYPT_SALT } = process.env;

const httpStatus = require("http-status");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const APIError = require("../utils/APIError");
const { createExtension } = require("../services/asterisk");
const { OTPModel, Users, Invitation, Friends, Groups } = require("../models");

const { sendEmail } = require("../services");

const { getRandomNumber, createToken } = require("../utils");

const sendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    let user = await Users.findOne({ email });
    if (!user) {
      throw new APIError({
        message: "User not found with this email ID",
        status: 400,
      });
    }
    const otp = randomize("000000");
    let emailStatus = await sendEmail({
      to: email,
      subject: "RogerThat Account Verification",
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
      { email },
      { otp: hash, email },
      { new: true, upsert: true }
    );
    return res.send({ message: "Verification Email Has Been Sent" });
  } catch (e) {
    next(e);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    let { otp, email } = req.body;
    let user = await Users.findOne({ email });
    if (user && user.is_verified) {
      return res.send({ message: "You are already verified" });
    }
    if (!user) {
      throw new APIError({
        message: "User not found with this email ID",
        status: 400,
      });
    }
    let otpData = await OTPModel.findOne({ email });
    if (!otpData) {
      throw new APIError({
        message: "OTP Does not match or Does not exists",
        status: 400,
      });
    }
    if (otpData && otpData.email == email) {
      let comparable = `${otp}${email}`;
      let isSuccess = await bcrypt.compare(comparable, otpData.otp);
      if (isSuccess) {
        user.is_verified = true;
        await OTPModel.deleteOne({ email });
        await user.save();
        return res.send({ message: "Verified successfully, Please Sign In." });
      } else {
        throw new APIError({
          message: "Invalid OTP, Please try again.",
          status: 400,
        });
      }
    } else {
      throw new APIError({
        message: "Invalid OTP, Please try again.",
        status: 400,
      });
    }
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const filterUser = { email };
  try {
    let user = await Users.findOne(filterUser);
    if (!user) {
      throw new APIError({
        message: "orry, You are not registered with us, Please Sign Up.",
        status: 400,
      });
    }

    let userData = await bcrypt.compare(password, user.password);
    //if both match than you can do anything
    if (userData) {
      if (user && !user.is_verified) {
        throw new APIError({
          message: "For login please verify your email first",
          status: 400,
        });
      }

      let jwtAuthToken = await createToken(user.email);
      return res.status(httpStatus.OK).send({
        message: "Login Success.",
        token: jwtAuthToken,
        data: user,
        success: true,
      });
    } else {
      throw new APIError({
        message: "Invalid credencials",
        status: 400,
      });
    }
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  const { email, password, first_name, last_name } = req.body;
  try {
    let user = await Users.findOne({ email });

    // check whether user is already registered or not.
    if (user && user.email) {
      throw new APIError({
        message: "User already registered, Please Sign In",
        status: 400,
      });
    } else {
      let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
      let hashedPassword = await bcrypt.hash(password, salt);

      let newUser = new Users({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
      newUser.extension = await createExtension(password);
      let userResp = await newUser.save();
      return res.status(httpStatus.CREATED).send({
        message:
          "You have been successfully registered, please verify and proceed.",
        status: true,
        data: userResp,
      });
    }
  } catch (e) {
    throw next(e);
  }
};

const allUsers = async (req, res) => {
  try {
    const users = await Users.find().select("-password");
    return res.send({
      message: "All users list",
      data: users,
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  registerUser,
  login,
  verifyAccount,
  sendVerificationEmail,
  allUsers,
};
