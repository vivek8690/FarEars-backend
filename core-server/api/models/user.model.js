/**
 * Schema definition for Users
 */
const mongoose = require("mongoose");
const { uploadFromURL } = require("../services/profile.service");

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
    profile: {
      type: String,
    },
    deviceToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  try {
    if (!this.profile) {
      const profileURL = await uploadFromURL(
        `${this.first_name}+${this.last_name}`
      );
      this.profile = profileURL;
    }
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * @model Users
 */
module.exports = mongoose.model("users", UserSchema);
