- /**
 * Schema definition for OTP
 */
const mongoose = require('mongoose');

const AddFriendSchema = new mongoose.Schema(
	{
		user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
		},
    contacts:[
      {
        type: Schema.Types.ObjectId,
        ref: 'User', //populate to User model
      }
  ]
	},
	{ timestamps: true }
);


/**
 * @model OTP
 */
module.exports = mongoose.model('add_friend', AddFriendSchema);
