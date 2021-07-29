/**
 * Schema definition for Users
 */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    extension: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    invitedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @model Users
 */
module.exports = mongoose.model("users", UserSchema);
