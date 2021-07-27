/**
 * Schema definition for Endpoint
 */
const mongoose = require('mongoose');

const EndpointSchema = new mongoose.Schema(
	{
		// Ps_endpoint model fields
		_id: {
			type: String,
			required: 'Please fill endpoint id',
		},
		aors: {
			type: String,
			required: 'Please fill endpoint aor',
		},
		auth: {
			type: String,
		},
		context: {
			type: String,
			default: 'testing',
			required: 'context required',
		},
		disallow: {
			type: String,
			default: 'all',
		},
		allow: {
			type: String,
			default: 'ulaw,gsm,speex,opus',
		},
		direct_media: {
			type: String,
			default: 'yes',
		},
		rewrite_contact: {
			type: String,
			default: 'yes',
		},
		force_rport: {
			type: String,
			default: 'yes',
		},
		rtp_symmetric: {
			type: String,
			default: 'yes',
		},
		transport: {
			type: String,
			default: 'transport-tcp-nat',
		},
	},
	{ versionKey: false, _id: false }
);

/**
 * @model Endpoint
 */
module.exports = mongoose.model('ps_endpoints', EndpointSchema);
