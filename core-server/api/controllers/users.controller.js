const { BCRYPT_SALT, CLIENT_ID } = process.env;

const httpStatus = require("http-status");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

const APIError = require("../utils/APIError");
const {
  createExtension,
  createAsteriskPassword,
} = require("../services/asterisk");
const { OTPModel, Users, Invitation, Friends, Groups } = require("../models");

const { sendEmail } = require("../services");
const { sendOTPEmail, saveUserDetails } = require("../services/user.service");
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
    email = email.trim();
    otp = otp.trim();
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
          message: "Account verified successfully",
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
  let { email, password, deviceToken } = req.body;
  email = email.trim();
  password = password.trim();
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
        message: "Email/Password is wrong",
        errCode: "invalid_creds",
        status: 400,
      });
    }
  } catch (err) {
    next(err);
  }
};

const loginWithGoogle = async (req, res, next) => {
  try {
    const { token } = req.body;
    console.log(token);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    let {
      email,
      sub: password,
      given_name: first_name,
      family_name: last_name,
      picture: profile,
    } = payload;
    let user = await Users.findOne({
      email,
    });

    // check whether user is already registered or not.
    if (!user) {
      user = await saveUserDetails({
        email,
        password,
        first_name,
        last_name,
        profile,
        loginWith: "google",
      });
    }
    const userid = payload["sub"];
    let jwtAuthToken = await createToken(payload.email);
    return res.status(httpStatus.OK).send({
      message: "Login Success.",
      token: jwtAuthToken,
      data: user,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPasswordOTP = async (req, res, next) => {
  try {
    let { email } = req.body;
    console.log("email", email);
    await sendOTPEmail(email);
    return res.status(httpStatus.OK).send({
      message: "Otp sent to registered email address.",
      data: { email },
      success: true,
    });
  } catch (e) {
    next(e);
  }
};

const forgotPasswordVerify = async (req, res, next) => {
  try {
    let { otp, newPassword, email } = req.body;
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
    let user = await Users.findOne({ email });
    if (otpData && otpData.email == email) {
      let comparable = `${otp}${email}`;
      let isSuccess = await bcrypt.compare(comparable, otpData.otp);
      if (!isSuccess) {
        throw new APIError({
          message: "OTP Does not match or Does not exists",
          errCode: "invalid_otp",
          status: 400,
        });
      }
      if (isSuccess && user) {
        let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
        let hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await createAsteriskPassword(newPassword, user.extension);
        await OTPModel.deleteOne({
          email,
        });
        await user.save();
      }
    }

    return res.status(httpStatus.OK).send({
      message: "Now you can login with new password.",
      data: { email },
      success: true,
    });
  } catch (e) {
    next(e);
  }
};

const registerUser = async (req, res, next) => {
  let { email, password, first_name, last_name } = req.body;
  email = email.trim();
  password = password.trim();
  first_name = first_name.trim();
  last_name = last_name.trim();
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
      const userResp = await saveUserDetails({
        email,
        password,
        first_name,
        last_name,
      });
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

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    let userData = await bcrypt.compare(oldPassword, req.user.password);
    if (userData) {
      let user = await Users.findOne({
        email: req.user.email,
      });
      let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
      let hashedPassword = await bcrypt.hash(newPassword, salt);
      await createAsteriskPassword(newPassword, req.user.extension);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({
        message: "Password changed successfully",
        status: true,
      });
    } else {
      throw new APIError({
        message: "Old password is wrong",
        errCode: "invalid_creds",
        status: 400,
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
      user = await Users.findOne({ email: req.user.email });
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
};

const fetchUserByExtension = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await Users.findOne({ extension: id });
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
    let user = await Users.findOne({ _id: req.user._id });
    user.first_name = first_name;
    user.last_name = last_name;
    await user.save();
    return res.send({
      message: "User updated Successfully.",
      data: user,
    });
  } catch (err) {
    console.log(err);
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
  changePassword,
  forgotPasswordOTP,
  forgotPasswordVerify,
  loginWithGoogle,
};
