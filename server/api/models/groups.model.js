/**
 * Schema definition for Groups
 */
const mongoose = require('mongoose');

const GroupsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		},
		members: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		}]
	},
	{  timestamps: true }
);

/**
 * @model GroupsSchema
*/
module.exports = mongoose.model('groups', GroupsSchema);
