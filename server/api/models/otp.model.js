/**
 * Schema definition for OTP
 */
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
	{
		otp: {
			type: String,
		},
		mobile: {
			type: String,
		},
		extension: {
			type: String,
		},
	},
	{ timestamps: true }
);

OTPSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 });

/**
 * @model OTP
 */
module.exports = mongoose.model('otps', OTPSchema);
