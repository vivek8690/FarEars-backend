/**
 * Schema definition for Users
 */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
    first_name:{
      type: String,
    },
    last_name:{
      type: String,
    },
    email:{
      type: String,
    },
    password:{
      type: String
    },
    profile_photo: {
      type: String,
    },
    extension:{
      type: Schema.Types.ObjectId,
			ref: 'Endpoint',
    },
    is_verified:{
      type: Boolean,
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
