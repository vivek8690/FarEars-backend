/**
 * Schema definition for Friends
 */
const mongoose = require('mongoose');

const FriendsSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		},
		contacts: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		}]
	},
	{  timestamps: true }
);

/**
 * @model Friends
 */
module.exports = mongoose.model('friends', FriendsSchema);
