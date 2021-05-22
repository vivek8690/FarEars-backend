const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Users = require('../models/auth.model');
const Endpoint = require('../models/endpoint.model');
const Aors = require('../models/aor.model');
const logger = require('../../config/logger');


/**
 * Create new User
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
        context: "testing",
        transport: "transport-tcp-nat",
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
