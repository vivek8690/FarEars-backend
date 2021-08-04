var ObjectId = require('mongoose').Types.ObjectId;
const { Users, Invitation, Friends } = require("../models");
const APIError = require("../utils/APIError");

const getAllFriends = async (req, res, next) => {
  try {
    const myInitiated = await Invitation.find({
      isAccepted: true,
      fromUser: req.user._id,
    }).populate("toUser");

    const gotInvited = await Invitation.find({
      isAccepted: true,
      toUser: req.user._id,
    }).populate("fromUser");

    let contacts = [...myInitiated, ...gotInvited].map((obj) => {
      return ObjectId.isValid(obj.fromUser) ? obj.toUser : obj.fromUser;
    })
    const unique = contacts.filter((user)=> {
      return String(user._id) !== String(req.user._id);
    });
    return res.send({
      message: "Your friends list",
      data:unique
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllFriends };
