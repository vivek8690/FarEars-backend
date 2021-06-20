const express = require('express');

const router = express.Router();

const {
	validateUser,
	isUserVerified,
	uploadFile,
} = require('../../middlewares');
const {
	uploadExtensions,
	getExtensions,
	getUserExtensions,
} = require('../../controllers/extensions.controller');

// TODO: Check User Auth Later.
router.get('/', getUserExtensions);

router.post(
	'/csv',
	validateUser,
	isUserVerified,
	uploadFile.single('file'),
	uploadExtensions
);

router.get('/csv', validateUser, isUserVerified, getExtensions);

module.exports = router;
