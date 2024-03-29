/**
 * Schema definition for Aor
 */
const mongoose = require("mongoose");

const AorSchema = new mongoose.Schema(
  {
    // Ps_aor model fields
    // ...
    _id: {
      type: String,
      required: "Please fill AOR name",
    },
    max_contacts: {
      type: String,
      default: "1",
    },
    minimum_expiration: {
      type: String,
      default: "60",
    },
    maximum_expiration: {
      type: String,
      default: "60",
    },
    remove_existing: {
      type: String,
      default: "yes",
    },
  },
  { versionKey: false, _id: false }
);

/**
 * @model Aor
 */
module.exports = mongoose.model("ps_aors", AorSchema);
