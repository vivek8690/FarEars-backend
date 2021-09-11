const crypto = require("crypto");
const mongoose = require("mongoose");
const { PSAors, PSAuth, PSEndpoint } = require("../models");
const MIN_EXT_RANGE = 1001;
const MAX_EXT_RANGE = 9999;

const createExtension = async function (password) {
  try {
    const session = await mongoose.startSession();
    let allRegisteredExt = await PSEndpoint.find({}).select("_id");
    allRegisteredExt = allRegisteredExt.map((ext) => parseInt(ext._id));
    let extension = MIN_EXT_RANGE;
    for (let i = MIN_EXT_RANGE; i < MAX_EXT_RANGE; i++) {
      if (allRegisteredExt.indexOf(i) == -1) {
        extension = i;
        break;
      }
    }
    const plainText = extension + ":" + "asterisk" + ":" + password;
    const md5Hash = crypto.createHash("md5").update(plainText).digest("hex");
    await session.startTransaction();
    const auth = new PSAuth({
      username: extension,
      md5_cred: md5Hash,
      _id: extension,
    });

    const aors = new PSAors({
      _id: extension,
    });

    const endpoint = new PSEndpoint({
      aors: extension,
      _id: extension,
      auth: extension,
    });
    await Promise.all([auth.save(), aors.save(), endpoint.save()]);
    await session.commitTransaction();
    session.endSession();
    return extension;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const createAsteriskPassword = async (password, extension) => {
  const plainText = extension + ":" + "asterisk" + ":" + password;
  const md5Hash = crypto.createHash("md5").update(plainText).digest("hex");
  const psAuth = await PSAuth.findOne({_id: extension});
  psAuth.md5_cred = md5Hash;
  return psAuth.save();
};

module.exports = {
  createExtension,
  createAsteriskPassword,
};
