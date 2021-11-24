const PSAors = require("./aor.model");
const PSAuth = require("./auth.model");
const PSEndpoint = require("./endpoint.model");
const Identify = require("./identify.model");
const OTPModel = require("./otp.model");
const Users = require("./user.model");
const Groups = require("./groups.model");
const Invitation = require("./invitation.model");
const Friends = require("./friends.model");
const CDR = require("./cdr.model");
const Recording = require("./recording.model");
const Session = require("./sessions.model");

module.exports = {
  PSAors,
  PSAuth,
  PSEndpoint,
  Identify,
  OTPModel,
  Invitation,
  Users,
  Groups,
  Friends,
  CDR,
  Recording,
  Session
};
