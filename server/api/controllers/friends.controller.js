const ObjectId = require("mongoose").Types.ObjectId;
const { Invitation } = require("../models");
const APIError = require("../utils/APIError");
const { getAllFriendsList } = require("../services/friends.service");

const getAllFriends = async (req, res, next) => {
  try {
    const uniqueFriends = await getAllFriendsList(req.user);
    return res.status(200).send({
      message: "Your friends list",
      data: uniqueFriends,
    });
  } catch (err) {
    next(err);
  }
};

const validateFriends = async (req, res, next) => {
  try {
    const uniqueFriends = await getAllFriendsList(req.user);
    console.log(uniqueFriends);
    console.log(req.query);
    const filteredFriends = uniqueFriends.filter((usr) => req.query.to.includes(usr.extension));
    filteredFriends.push(req.user);
    res.status(200).json({
      message: "callee details",
      data: filteredFriends,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllFriends, validateFriends };
