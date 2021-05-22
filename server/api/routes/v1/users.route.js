const express = require('express');
const controller = require('../../controllers/users.controller');
const router = express.Router();

// Signup using user id & pass
router
  .route('/register')
  .post(controller.create);

// Signup using google
router.get("/auth/google",controller.makeAuthentication);

router.get("/auth/google/callback", controller.registerUser);

module.exports = router;