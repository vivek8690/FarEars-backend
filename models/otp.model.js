/**
 * Schema definition for OTP
 */
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
	{
		otp: {
			type: String,
		},
		email: {
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
