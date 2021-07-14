/**
 * Schema definition for InviteFriend
 */
const mongoose = require('mongoose');

const InviteFriend = new mongoose.Schema(
	{
		fromUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		},
		toUser: {
			type: mongoose.Schema.Types.ObjectId,
  			ref: 'users'
		},
		isAccepted:{
			type:Boolean,
			default: false
		},
	},
	{ timestamps: true }
);

/**
 * @model InviteFriend
 */
module.exports = mongoose.model('inviteFriend', InviteFriend);
