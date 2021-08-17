/**
 * Schema definition for InviteFriend
 */
const mongoose = require("mongoose");

const Invitation = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      enum : ['created','accepted','declined'],
      default: 'created'
    },
  },
  { timestamps: true }
);

/**
 * @model Invitation
 */
module.exports = mongoose.model("invitation", Invitation);
