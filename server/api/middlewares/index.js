const { isUserVerified } = require('./isUserVerified');
const { validateUser } = require('./validateUser');
const { uploadFile } = require('./upload');

module.exports = {
	validateUser,
	isUserVerified,
	uploadFile,
};
