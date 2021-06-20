const { Users } = require('../models');
const { validateToken } = require('../utils');

const validateUser = async (req, res, next) => {
	try {
		const authHeader = req.headers['authorization'];
		const authToken = authHeader && authHeader.split(' ')[1];
		if (!authToken) {
			return res
				.status(401)
				.send({ status: false, message: 'No token provided.' });
		}
		const tokenData = await validateToken(authToken);
		let user = await Users.findOne({ extension: tokenData.extension });
		if (user && user.extension) {
			req.user = user;
			next();
		} else {
			return res
				.status(400)
				.send({ status: false, message: 'User Not Found.' });
		}
	} catch (error) {
		if (
			error.name == 'JsonWebTokenError' ||
      error.name == 'NotBeforeError' ||
      error.name == 'TokenExpiredError'
		) {
			return res.status(400).send({ status: false, message: 'Invalid Token' });
		} else {
			return res
				.status(401)
				.send({ status: false, message: 'User is not authenticated' });
		}
	}
};

module.exports = { validateUser };
