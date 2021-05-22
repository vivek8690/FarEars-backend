const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/users.controller');
const {
    createUser,
} = require('../../validations/users.validation');

const { google } = require('googleapis');

const redirectURI = "auth/google";

const SERVER_ROOT_URI = "http://freeline.ml/v1";

const GOOGLE_CLIENT_ID  = "536876666776-30gen3k92ravejio3dcllofn1vsuok67.apps.googleusercontent.com";

const router = express.Router();

  // Fetch the user's profile with the access token and bearer
function getGoogleAuthURL() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${SERVER_ROOT_URI}/${redirectURI}`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
};

return `${rootUrl}?${querystring.stringify(options)}`;
}

router
    .route('/register')
    .post(controller.create);


router.get("/auth/google/url", (req, res) => {
  return res.send(getGoogleAuthURL());
});

module.exports = router;
