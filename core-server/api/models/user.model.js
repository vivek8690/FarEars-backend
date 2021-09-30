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
      select: false
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
    status: {
      type: String,
      enum: ['online','offline'],
      default: 'offline'
    },
    deviceToken: {
      type: String,
    },
    loginWith: {
      type: String,
      default: "email",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const { broadcastUpdate } = require("../services/user.service");
  try {
    await broadcastUpdate(this.toJSON());
    if (!this.profile || this.profile === '') {
      const profileURL = await uploadFromURL(
        `${this.first_name}+${this.last_name}`
      );
      this.profile = profileURL;
    }
    if(!this.loginWith){
      this.loginWith = "email"
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
