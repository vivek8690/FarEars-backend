const ObjectId = require("mongoose").Types.ObjectId;
const { Invitation, Users, CDR, Recording } = require("../models");
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

const createRecording = async (req, res, next) => {
  try {
    const { toUser, fromUser, s3Filename } = req.body;
    const recording = await Recording.create({
      toUser,
      fromUser,
      s3URL: `https://recordings-far-ears.s3.ap-south-1.amazonaws.com/${s3Filename}.wav`,
    });
    res.status(200).json({
      message: "Recording created",
      data: recording,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getAllRecordings = async (req, res, next) => {
  try {
    const recordings = await Recording.find()
      .or([
        { fromUser: req.user.extension },
        { toUser: req.user.extension },
        { fromUser: req.query.ofExtension },
        { toUser: req.user.ofExtension },
      ])
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Recordings list",
      data: recordings,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  getAllFriends,
  validateFriends,
  getAllRecents,
  getAllRecordings,
  createRecording,
};
