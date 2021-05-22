const {google} = require('googleapis')

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: process.env.GOOGLE_AUTH_REDIRECT_URL, // this must match your google api settings
};

const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

exports.createConnection = () => {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

exports.urlGoogle = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
}

exports.getConnectionUrl = (auth) => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

exports.googleConfig = googleConfig;