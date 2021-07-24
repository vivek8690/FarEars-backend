/**
 * Schema definition for InviteFriend
 */
const mongoose = require('mongoose');

const Invitation = new mongoose.Schema(
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
 * @model Invitation
 */
module.exports = mongoose.model('invitation', Invitation);
