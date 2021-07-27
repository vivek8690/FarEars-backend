var ObjectId = require('mongoose').Types.ObjectId;
const { Users, Invitation, Friends } = require("../models");
const APIError = require("../utils/APIError");

const getAllFriends = async (req, res, next) => {
  try {
    const myInitiated = await Invitation.find({
      isAccepted: true,
      fromUser: req.user._id,
    }).populate("fromUser");

    const gotInvited = await Invitation.find({
      isAccepted: true,
      toUser: req.user._id,
    }).populate("toUser");

    const contacts = [...myInitiated, ...gotInvited].map((obj) => {
      return ObjectId.isValid(obj.fromUser) ? obj.toUser : obj.fromUser;
    })

    return res.send({
      message: "Your friends list",
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllFriends };
