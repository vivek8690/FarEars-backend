- /**
 * Schema definition for OTP
 */
const mongoose = require('mongoose');

const AddFriendSchema = new mongoose.Schema(
	{
		fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
		},
		toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
		},
    isAccepted:{
      type:Boolean,
      default: false
    }
	},
	{ timestamps: true }
);


/**
 * @model OTP
 */
module.exports = mongoose.model('add_friend', AddFriendSchema);
