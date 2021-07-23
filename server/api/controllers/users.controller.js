const { BCRYPT_SALT } = process.env;

const httpStatus = require("http-status");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const randomize = require("randomatic");
const APIError = require("../utils/APIError");
const { createExtension } = require("../services/asterisk");

const {
  PSAors,
  PSAuth,
  PSEndpoint,
  OTPModel,
  Users,
  InviteFriend,
  Friends,
  Groups,
} = require("../models");

const { sendEmail } = require("../services");

const { getRandomNumber, createToken } = require("../utils");

const sendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = randomize("000000");
    let emailStatus = await sendEmail({
      to: email,
      subject: "RogerThat Account Verification",
      html: `OTP For Account Verification is ${otp}`,
      text: otp,
    });

    if (emailStatus.accepted && emailStatus.accepted.indexOf(email) == -1) {
      return res.send({
        message: "Technical error while sending email, please try again.",
      });
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
    if(!user){
      throw new Error('User not found with this email ID');
    }
    let otpData = await OTPModel.findOne({ email });
    if (!otpData) {
      return res.send({ message: "OTP Does not match or Does not exists" });
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
        return res.send({ message: "Invalid OTP, Please try again." });
      }
    } else {
      return res.send({ message: "Invalid OTP, Please try again." });
    }
  } catch (e) {
    next(e)
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const filterUser = { email };
  try {
    let user = await Users.findOne(filterUser);
    if (!user) {
      return res.status(400).send({
        status: false,
        message: `Sorry, You are not registered with us, Please Sign Up.`,
      });
    }

    let userData = await bcrypt.compare(password, user.password);
    //if both match than you can do anything
    if (userData) {
      if (user && !user.is_verified) {
        return res.status(400).send({
          status: false,
          message: "You are not verified with us, please verify yourself first",
        });
      }

      let jwtAuthToken = await createToken(user.email);

      const updateUserObject = {
        auth_token: jwtAuthToken,
      };

      await Users.findOneAndUpdate(filterUser, updateUserObject, {
        new: true,
      });
      return res.status(httpStatus.OK).send({
        message: "Login Success.",
        token: jwtAuthToken,
        success: true,
      });
    } else {
      return res.status(400).send({ msg: "Invalid credencial" });
    }
  } catch (error) {
    console.log(error, "error");
    return res.status(500).send({
      status: false,
      message: "Internal Server Error while Login in...",
    });
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
    console.log(e);
    throw next(e);
  }
};

const checkUserVerified = async (req, res, next) => {
  try {
    let { email } = req.body;
    let user = await Users.findOne({ email });
    if (user && user.is_verified) {
      return res.status(200).send({
        message: "You are already verified.",
        success: true,
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).send({
      message: "Error while verifiying user's status",
      success: false,
    });
  }
};

const inviteUser = async (req, res) => {
  try {
    let { email } = req.body;
    let { first_name, last_name } = req.user;
    let userExist = await Users.findOne({ email });
    if (userExist) {
      let emailStatus = await sendEmail({
        to: email,
        subject: "RogerThat User Invitation",
        html: `Hey there! Your Friend  ${first_name} ${last_name} has invited you RogerThat.`,
        text: "",
      });

      if (emailStatus.accepted && emailStatus.accepted.indexOf(email) == -1) {
        return res.send({
          message: "Technical error while sending email, please try again.",
        });
      }

      await InviteFriend.findOneAndUpdate(
        { fromUser: req.user._id, toUser: userExist._id },
        { toUser: userExist._id, fromUser: req.user._id },
        { new: true, upsert: true }
      );

      return res.send({
        message: "Invitation has been sent successfully.",
      });
    } else {
      return res.send({
        message:
          "Sorry, Your friend does not have an account with RogerThat, Please ask him/her to sign up",
      });
    }
  } catch (error) {
    return res.send({
      message: "Technical error while sending invitation, please try again.",
    });
  }
};

const manageInvite = async (req, res) => {
  try {
    let { userId, isAccepted } = req.body;
    let { first_name, last_name, email } = req.user;
    // let userExist = await Friends.find({
    //   user: req.user._id,
    // });

    // if (userExist.length) {
    await InviteFriend.findOneAndUpdate(
      { fromUser: req.user._id, toUser: userId },
      { isAccepted },
      { new: true, upsert: true }
    );

    await Friends.findOneAndUpdate(
      { user: req.user._id },
      { $push: { contacts: userId } },
      { new: true }
    );

    return res.send({
      message: isAccepted ? "User added successfully." : "Invite Declined.",
      success: true,
    });
    // } else {
    // return res.send({
    //   message: "Sorry, User Does not exists",
    //   success: true,
    // });
    // }
  } catch (error) {
    console.log(error, "error");
    return res.send({
      message: "Technical error while updating invite, please try again.",
    });
  }
};

const allUsers = async (req,res) =>{
  try{
    const users = await Users.find().select('-password');
    return res.send({
      message: "All users list",
      data: users
    });
  }catch(err){
    throw err;
  }
}

module.exports = {
  registerUser,
  login,
  verifyAccount,
  checkUserVerified,
  sendVerificationEmail,
  inviteUser,
  manageInvite,
  allUsers
};
