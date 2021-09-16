const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const APIError = require('../utils/APIError');
const { env } = require('../../config/vars');

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res) => {
	const response = {
		code: err.status,
		message: err.message || httpStatus[err.status],
		errors: err.errors,
		stack: err.stack,
		errCode: err.errCode || 'Unhandled_code'
	};

	if (env !== 'development') {
		delete response.stack;
	}
	console.log(err);
	res.status(err.status);
	return res.json(response);
};
exports.handler = handler;

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
exports.converter = (err, req, res, next) => {
	let convertedError = err;
	if (err instanceof expressValidation.ValidationError) {
		convertedError = new APIError({
			message: 'Validation Error',
			errors: err.errors,
			status: err.status,
			stack: err.stack,
			errCode: err.errCode || 'Unhandled_code'

		});
		return handler(convertedError, req, res);
	} else if (!(err instanceof APIError)) {
		convertedError = new APIError({
			message: err.message,
			status: err.status,
			stack: err.stack,
			errCode: err.errCode
		});
		return handler(convertedError, req, res);
	}else if(err instanceof APIError){
		return handler(convertedError, req, res);
	}
	next();
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
exports.notFound = (req, res) => {
	const err = new APIError({
		message: 'Not found',
		status: httpStatus.NOT_FOUND,
	});
	return handler(err, req, res);
};
