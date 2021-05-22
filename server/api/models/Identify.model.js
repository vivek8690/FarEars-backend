/**
 * Schema definition for Identify
 */
const mongoose = require('mongoose');

const IdentifySchema = new mongoose.Schema({
	endpoint: String,
	match: String,
}, {
	timestamps: true,
});

/**
 * @model Identify
 */
module.exports = mongoose.model('Identify', IdentifySchema);
