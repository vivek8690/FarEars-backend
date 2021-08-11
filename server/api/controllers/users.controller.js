const { BCRYPT_SALT } = process.env;

const httpStatus = require("http-status");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const APIError = require("../utils/APIError");
const { createExtension } = require("../services/asterisk");
const { OTPModel, Users, Invitation, Friends, Groups } = require("../models");

const { sendEmail } = require("../services");
const { sendOTPEmail } = require("../services/user.service");
const { imageUpload } = require("../services/s3.service");
const { getRandomNumber, createToken } = require("../utils");

const sendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    let user = await Users.findOne({
      email,
    });
    if (!user) {
      throw new APIError({
        message: "User not found with this email ID",
        errCode: "email_not_registered",
        status: 400,
      });
    }
    await sendOTPEmail(email);
    return res.send({
      message: "Verification Email Has Been Sent",
    });
  } catch (err) {
    next(err);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    let { otp, email } = req.body;
    let user = await Users.findOne({
      email,
    });
    if (user && user.is_verified) {
      throw new APIError({
        message: "Already Verified",
        errCode: "verified",
        status: 400,
      });
    }
    if (!user) {
      throw new APIError({
        message: "User not found with this email ID",
        errCode: "email_not_registered",
        status: 400,
      });
    }
    let otpData = await OTPModel.findOne({
      email,
    });
    if (!otpData) {
      throw new APIError({
        message: "OTP Does not match or Does not exists",
        errCode: "invalid_otp",
        status: 400,
      });
    }
    if (otpData && otpData.email == email) {
      let comparable = `${otp}${email}`;
      let isSuccess = await bcrypt.compare(comparable, otpData.otp);
      if (isSuccess) {
        user.is_verified = true;
        await OTPModel.deleteOne({
          email,
        });
        await user.save();
        return res.send({
          message: "Verified successfully, Please Sign In.",
        });
      } else {
        throw new APIError({
          message: "Invalid OTP, Please try again.",
          errCode: "invalid_otp",
          status: 400,
        });
      }
    } else {
      throw new APIError({
        message: "Invalid OTP, Please try again.",
        errCode: "invalid_otp",
        status: 400,
      });
    }
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password, deviceToken } = req.body;
  const filterUser = {
    email,
  };
  try {
    let user = await Users.findOne(filterUser);
    if (!user) {
      throw new APIError({
        message: "Sorry, You are not registered with us, Please Sign Up.",
        status: 400,
        errCode: "email_not_registered",
      });
    }

    let userData = await bcrypt.compare(password, user.password);
    //if both match than you can do anything
    if (userData) {
      if (user && !user.is_verified) {
        await sendOTPEmail(email);
        throw new APIError({
          message:
            "For login please verify your email first, just sent on your email",
          status: 400,
          errCode: "email_not_verified",
        });
      }
      user.deviceToken = deviceToken;
      await user.save();
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
        errCode: "invalid_creds",
        status: 400,
      });
    }
  } catch (err) {
    next(err);
  }
};

const registerUser = async (req, res, next) => {
  const { email, password, first_name, last_name } = req.body;
  try {
    let user = await Users.findOne({
      email,
    });

    // check whether user is already registered or not.
    if (user && user.email) {
      throw new APIError({
        message: "User already registered, Please Sign In",
        errCode: "email_exist",
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
  } catch (err) {
    throw next(err);
  }
};

const allUsers = async (req, res, next) => {
  try {
    const users = await Users.find().select("-password");
    return res.send({
      message: "All users list",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

const updateUserProfilePicture = async (req, res, next) => {
  try {
    const base64 = req.body.image;
    let user;
    if (base64) {
      const location = await imageUpload(base64, req.user._id);
      user = await Users.findOne(
        { email: req.user.email }
      );
      user.profile = location;
      await user.save();
      return res.send({
        message: "Profile Picture Updated Successfully.",
        data: user,
      });
    } else {
      user.profile = base64;
      await user.save();
      return res.send({
        message: "Profile Picture Updated Successfully.",
        data: user,
      });
    }
  } catch (err) {
    next(err);
  }
};
const fetchUserById = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await Users.findById(id);
    return res.send({
      message: "User fetched Successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}


const fetchUserByExtension = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await Users.findOne({extension: id});
    return res.send({
      message: "User fetched Successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;
    let user = await Users.findOneAndUpdate(
      { _id: req.user._id },
      { first_name, last_name },
      { new: true }
    );
    return res.send({
      message: "User updated Successfully.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  login,
  verifyAccount,
  allUsers,
  updateUserProfilePicture,
  fetchUserById,
  fetchUserByExtension,
  sendVerificationEmail,
  updateUserById,
};
