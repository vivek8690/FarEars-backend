/**
 * Schema definition for Users
 */
const mongoose = require("mongoose");
const { uploadFromURL } = require("../services/profile.service");

const SessionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    ipInfo: {
      type: JSON
    },
    country:{
      type: String
    }
  },
  {
    timestamps: true,
  }
);

/**
 * @model Users
 */
module.exports = mongoose.model("sessions", SessionSchema);
