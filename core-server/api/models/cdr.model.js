/**
 * Schema definition for Users
 */
const mongoose = require("mongoose");

const CDRSchema = new mongoose.Schema(
  {
    src: {
      type: String,
      ref: "users",
    },
    dst: {
      type: String,
      ref: "users",
    },
    disposition: {
      type: String,
    },
    uniqueid: {
      type: String,
    },
    duration: {
      type: Number,
    },
    billsec: {
      type: Number,
    },
    start: Date,
    answer: Date,
    end: Date,
  },
  { strict: false }
);


CDRSchema.index({ start: -1 });
/**
 * @model Users
 */
module.exports = mongoose.model("cdr", CDRSchema, "cdr");
