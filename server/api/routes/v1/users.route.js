const express = require('express');

const {
	makeAuthentication,
	registerUser,
	sendOTP,
	addContact,
	validateOTP,
	verifyContact,
} = require('../../controllers/users.controller');

const { validateUser, isUserVerified } = require('../../middlewares');

const router = express.Router();

// Signup using google
router.get('/auth/google', makeAuthentication);

router.get('/auth/google/callback', registerUser);

router.post('/auth/send-otp', validateUser, sendOTP);

router.post('/auth/validate-otp', validateUser, validateOTP);

router.post('/auth/add-contact', validateUser, isUserVerified, addContact);

router.post(
	'/auth/verify-contact',
	validateUser,
	isUserVerified,
	verifyContact
);

module.exports = router;
