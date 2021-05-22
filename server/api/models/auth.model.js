/**
 * Schema definition for Auth
 */
const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema({
	// Ps_auth model fields
	// ...
	_id: {
		type: String,
		required: 'Please fill auth name'
	},
	auth_type: {
		type: String,
		default: 'userpass'
	},
	username: {
		type: String,
		required: 'Please fill username'
	},
	password: {
		type: String
	}
}, { versionKey: false, _id: false });

/**
 * @model Auth
 */
module.exports = mongoose.model('ps_auths', AuthSchema);
