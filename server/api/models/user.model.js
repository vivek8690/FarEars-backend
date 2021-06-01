/**
 * Schema definition for Users
 */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		google_uid: {
			type: String,
		},
		email: {
			type: String,
		},
		extension: {
			type: String,
			ref: 'ps_auths',
		},
		google_access_token: {
			type: String,
		},
		auth_token: {
			type: String,
		},
		mobile: {
			type: String,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		verified_contacts: [
			{
				mobile: String,
				is_verified: {
					type: Boolean,
					default: false,
				},
			},
		],
		profile_photo: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * @model Aor
 */
module.exports = mongoose.model('users', UserSchema);
