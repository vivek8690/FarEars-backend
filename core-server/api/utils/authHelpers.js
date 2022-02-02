const { google } = require('googleapis');

const defaultScope = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
];

const googleConfig = {
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	redirect: process.env.GOOGLE_AUTH_REDIRECT_URL, // this must match your google api settings
};

const createConnection = () => {
	return new google.auth.OAuth2(
		googleConfig.clientId,
		googleConfig.clientSecret,
		googleConfig.redirect
	);
};

const urlGoogle = () => {
	const auth = createConnection();
	const url = getConnectionUrl(auth);
	return url;
};

const getConnectionUrl = (auth) => {
	return auth.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: defaultScope,
	});
};

module.exports = {
	googleConfig,
	urlGoogle,
	createConnection,
};
