const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Users = require('../models/auth.model');
const Endpoint = require('../models/endpoint.model');
const Aors = require('../models/aor.model');
const logger = require('../../config/logger');
const { google } = require('googleapis');
const authHelpers = require('../utils/authHelpers');
/**
 * Create new User using ID & Password
 * @public
 */
exports.create = async (req, res, next) => {
    const username = req.body.username;
    const userToken = req.headers['authorization'];
    const users = new Users({
        username: username,
        password: username,
        _id: username,
    });
    const aors = new Aors({
        _id: username,
    })
    const endpoint = new Endpoint({
        aors: username,
        _id: username,
        auth: username,
    });
    let userData = {};
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        userData = await users.save();
        await aors.save();
        await endpoint.save();
        await session.commitTransaction();
    } catch (error) {
        userData = null;
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
    return res.status(httpStatus.CREATED).json({
        data: userData
    });
};

exports.makeAuthentication = async(req,res,next) => {
    return res.redirect(authHelpers.urlGoogle());
}

exports.registerUser = async (req, res, next) => {
  if (req.query.error) {
    // The user did not give us permission.
        return res.status(500).send({error: req.query.error})
  } else {
    let code = req.query.code;    // get the code from req, need to get access_token for the user
    const oauth2Client = new google.auth.OAuth2(
    authHelpers.googleConfig.clientId,
    authHelpers.googleConfig.clientSecret,
    authHelpers.googleConfig.redirect
  );
  let { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials({access_token: tokens.access_token});    // use the new auth client with the access_token
  let oauth2 = google.oauth2({
  auth: oauth2Client,
  version: 'v2'
});
let { data } = await oauth2.userinfo.get();    // get user info
return res.send(data);
  }
}