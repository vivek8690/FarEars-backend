/**
 * Schema definition for InviteFriend
 */
const mongoose = require("mongoose");

const Recording = new mongoose.Schema(
  {
    fromUser: {
      type: String,
    },
    toUser: {
      type: String,
    },
    s3URL: {
      type: String
    },
  },
  { timestamps: true }
);

/**
 * @model Recording
 */
module.exports = mongoose.model("recording", Recording);
