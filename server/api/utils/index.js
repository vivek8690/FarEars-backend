const { JWT_SECRET } = process.env;
const { googleConfig, urlGoogle, createConnection } = require('./authHelpers');

const jwt = require('jsonwebtoken');

const getRandomNumber = (min, max) => {
	if (min > max) {
		let temp = max;
		max = min;
		min = temp;
	}

	if (min <= 0) {
		return Math.floor(Math.random() * (max + Math.abs(min) + 1)) + min;
	} else {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

const parseJWTError = (error) => {
	let errorMessage = error.message;
	let message = 'Invalid Token.';
	switch (error.name) {
	case 'JsonWebTokenError':
		if (
			['invalid token', 'jwt malformed', 'invalid signature'].indexOf(
				errorMessage
			) != -1
		) {
			message = 'Invalid Token.';
		}
		break;
	default: {
		message = 'Invalid Token.';
		break;
	}
	}
	return message;
};

const createToken = (payload) => {
	return new Promise((resolve, reject) => {
		jwt.sign(
			{
				extension: payload,
			},
			JWT_SECRET,
			(err, token) => {
				if (err) {
					return reject(err);
				}
				return resolve(token);
			}
		);
	});
};

const validateToken = (authToken) => {
	return new Promise((resolve, reject) => {
		jwt.verify(authToken, JWT_SECRET, function (err, decoded) {
			if (err) {
				return reject(err);
			}
			return resolve(decoded);
		});
	});
};

module.exports = {
	getRandomNumber,
	createToken,
	validateToken,
	parseJWTError,
	googleConfig,
	urlGoogle,
	createConnection,
};
