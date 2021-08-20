const ObjectId = require("mongoose").Types.ObjectId;
const { Invitation, Users, CDR } = require("../models");
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
    const filteredFriends = uniqueFriends.filter((usr) =>
      req.query.to.includes(usr.extension)
    );
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

const getAllRecents = async (req, res, next) => {
  try {
    const list = await CDR.find({ disposition: "ANSWERED" })
      .or([{ src: req.user.extension }, { dst: req.user.extension }])
      .sort({ start: -1 })
      .limit(30)
      .lean();
    for (const user of list) {
      const responses = await Promise.all([
        Users.findOne({ extension: user.src }),
        Users.findOne({ extension: user.dst }),
      ]);
      user.srcDisplay = `${responses[0]["first_name"]} ${responses[0]["last_name"]}`;
      user.srcImage = responses[0]["profile"];
      user.dstDisplay = `${responses[1]["first_name"]} ${responses[1]["last_name"]}`;
      user.dstImage = responses[1]["profile"];
    }
    res.status(200).json({
      message: "Recent list",
      data: list,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { getAllFriends, validateFriends, getAllRecents };
