var ObjectId = require("mongoose").Types.ObjectId;
const { Invitation } = require("../models");

const getAllFriendsList = async (userObj) => {
  try {
    const myInitiated = await Invitation.find({
      status: "accepted",
      fromUser: userObj._id,
    }).populate("toUser");

    const gotInvited = await Invitation.find({
      status: "accepted",
      toUser: userObj._id,
    }).populate("fromUser");

    let contacts = [...myInitiated, ...gotInvited].map((obj) => {
      return ObjectId.isValid(obj.fromUser) ? obj.toUser : obj.fromUser;
    });
    const unique = contacts.filter((user) => {
      return String(user._id) !== String(userObj._id);
    });
    return unique;
  } catch (err) {
    throw err;
  }
};

module.exports = { getAllFriendsList };
