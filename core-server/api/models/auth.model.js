/**
 * Schema definition for Auth
 */
const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema(
	{
		// Ps_auth model fields
		// ...
		_id: {
			type: String,
			required: 'Please fill auth name',
		},
		auth_type: {
			type: String,
			default: 'md5',
		},
		md5_cred: {
			type: String,
			required: 'Please fill md5 password',
		},
		username: {
			type: String,
			required: 'Please fill username',
		},
		realm: {
			type: String,
			default: 'asterisk',
		}
	},
	{ versionKey: false, _id: false }
);

/**
 * @model Auth
 */
module.exports = mongoose.model('ps_auths', AuthSchema);
