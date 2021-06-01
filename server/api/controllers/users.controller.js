const MIN_EXT_RANGE = 1000;
const MAX_EXT_RANGE = 9999;
const { BCRYPT_SALT } = process.env;

const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { google } = require('googleapis');
const bcrypt = require('bcrypt');
// const logger = require('../../config/logger');

const { PSAors, PSAuth, PSEndpoint, OTPModel, Users } = require('../models');

const { sendSMS } = require('../services');

const {
	getRandomNumber,
	createConnection,
	urlGoogle,
	createToken,
} = require('../utils');

const makeAuthentication = async (req, res) => {
	return res.redirect(urlGoogle());
};

const registerUser = async (req, res, next) => {
	if (req.query.error) {
		return res.status(httpStatus.BAD_REQUEST).send({
			message: 'Invalid User Credentials.',
			data: null,
			status: false,
		});
	} else {
		let { code } = req.query;

		if (!code) {
			return res.send({
				message: 'Invalid User Credentials.',
				data: null,
				status: false,
			});
		}

		const oauth2Client = createConnection();

		let { tokens } = await oauth2Client.getToken(code);

		oauth2Client.setCredentials({ access_token: tokens.access_token });

		let oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });

		let { data } = await oauth2.userinfo.get();

		let user = await Users.findOne({ email: data.email });

		if (user && user.email) {
			let jwtAuthToken = await createToken(user.extension);

			const filterUser = { email: data.email, extension: user.extension };

			const updateUserObject = {
				google_uid: user.id,
				google_access_token: tokens.access_token,
				auth_token: jwtAuthToken,
			};

			user = await Users.findOneAndUpdate(filterUser, updateUserObject, {
				new: true,
			});

			return res.status(200).send({
				success: true,
				message: 'User SignIn Successfully.',
				data: user,
			});
		} else {
			let allRegisteredExt = await PSEndpoint.find({}).select('_id');
			allRegisteredExt = allRegisteredExt.map((ext) => parseInt(ext._id));
			let extension = MIN_EXT_RANGE;
			for (let i = MIN_EXT_RANGE; i < MAX_EXT_RANGE; i++) {
				if (allRegisteredExt.indexOf(i) == -1) {
					extension = i;
					break;
				}
			}

			const jwtAuthToken = await createToken(extension);

			const user = new Users({
				name: data.name,
				google_uid: data.id,
				email: data.email,
				profile_photo: data.picture,
				google_access_token: tokens.access_token,
				auth_token: jwtAuthToken,
				extension,
			});

			const auth = new PSAuth({
				username: extension,
				password: extension,
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

			const session = await mongoose.startSession();

			await session.startTransaction();
			try {
				let userData = await user.save();
				await auth.save();
				await aors.save();
				await endpoint.save();
				await session.commitTransaction();
				await session.endSession();
				return res.status(httpStatus.CREATED).send({
					success: true,
					message: 'User SignIn Successfully.',
					data: userData,
				});
			} catch (error) {
				await session.abortTransaction();
				next(error, req, res);
			}
		}
	}
};

const verifyContact = async (req, res, next) => {
	try {
		const { extension } = req.user;
		const { mobile, otp } = req.body;
		const comparable = `${otp}${mobile}`;
		let OTPData = await OTPModel.findOne({ mobile, extension });
		if (OTPData) {
			let hashedOTP = await bcrypt.compare(comparable, OTPData.otp);
			if (hashedOTP) {
				let data = await Users.findOneAndUpdate(
					{ extension, 'verified_contacts.mobile': mobile },
					{ $set: { 'verified_contacts.$.is_verified': true } },
					{ new: true }
				);
				return res
					.status(httpStatus.OK)
					.send({ message: 'Verification successfull.', data, status: true });
			} else {
				return res
					.status(httpStatus.BAD_REQUEST)
					.send({ message: 'Invalid OTP', status: false, data: null });
			}
		} else {
			return res
				.status(httpStatus.BAD_REQUEST)
				.send({ message: 'User Not Found.', status: false, data: null });
		}
	} catch (error) {
		next(error, req, res);
	}
};

const addContact = async (req, res, next) => {
	try {
		const { extension, name } = req.user;

		const { mobile } = req.body;

		if (req.user.mobile == mobile) {
			return res.status(httpStatus.BAD_REQUEST).send({
				status: false,
				data: null,
				message: 'Mobile number should not be same as your mobile number.',
			});
		}

		const otp = getRandomNumber(100000, 999999);

		const body = `Hey, ${name} has requested you to have you in his/her critical caller list. Please provide him/her this One Time Password to ${otp} to approve his/her request.`;

		let userContact = await Users.find({ 'verified_contacts.mobile': mobile });

		const dataToHash = `${otp}${mobile}`;
		let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
		let hash = await bcrypt.hash(dataToHash, salt);
		let messageResp = await sendSMS(body, mobile);

		if (messageResp.error_code) {
			return res
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send({ message: 'Failed to send OTP, Please try again.' });
		}
		if (userContact.length) {
			await OTPModel.findOneAndUpdate(
				{ mobile, extension },
				{ otp: hash },
				{ new: true, upsert: true }
			);
			return res
				.status(httpStatus.OK)
				.send({ message: 'OTP has been sent.', data: null, success: true });
		} else {
			let otpData = new OTPModel({
				otp: hash,
				mobile,
				extension,
			});

			await otpData.save();
			let newContact = {
				mobile,
			};

			await Users.findOneAndUpdate(
				{ extension },
				{ $push: { verified_contacts: newContact } },
				{ new: true }
			);
			return res
				.status(httpStatus.OK)
				.send({ message: 'OTP has been sent.', data: null, status: true });
		}
	} catch (error) {
		next(error, req, res);
	}
};

const validateOTP = async (req, res, next) => {
	try {
		const { otp, mobile } = req.body;
		const { extension } = req.user;
		const comparable = `${otp}${mobile}`;
		let OTPData = await OTPModel.findOne({ mobile, extension });
		if (OTPData) {
			let hashedOTP = await bcrypt.compare(comparable, OTPData.otp);
			if (hashedOTP) {
				const filter = { extension };
				const update = { verified: true, mobile };
				await Users.findOneAndUpdate(filter, update, { new: true });
				await OTPModel.findOneAndRemove({ mobile, extension });
				return res.status(httpStatus.OK).send({
					status: true,
					message: 'Verification successfull.',
					data: null,
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).send({
					status: false,
					data: null,
					message: 'Invalid OTP',
				});
			}
		} else {
			return res.status(httpStatus.BAD_REQUEST).send({
				status: false,
				data: null,
				message: 'Invalid OTP',
			});
		}
	} catch (error) {
		next(error, req, res);
	}
};

const sendOTP = async (req, res, next) => {
	try {
		const mobile = req.body.mobile;
		const extension = req.user.extension;
		const OTP = getRandomNumber(100000, 999999);
		const body = `OTP For user registration to Critic Alert is ${OTP}, This OTP will expire in 10 minutes.`;
		let messageResp = await sendSMS(body, mobile);

		if (messageResp.error_code) {
			return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
				data: null,
				status: false,
				message: 'Failed to send OTP, Please try again.',
			});
		} else {
			const dataToHash = `${OTP}${mobile}`;
			let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
			let hash = await bcrypt.hash(dataToHash, salt);
			let otpData = new OTPModel({
				otp: hash,
				mobile,
				extension,
			});
			await otpData.save();
			return res
				.status(httpStatus.OK)
				.send({ data: null, status: true, message: 'OTP has been sent.' });
		}
	} catch (error) {
		next(error, req, res);
	}
};

module.exports = {
	registerUser,
	makeAuthentication,
	validateOTP,
	sendOTP,
	addContact,
	verifyContact,
};
