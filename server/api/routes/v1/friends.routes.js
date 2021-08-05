const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middlewares");
const { getAllFriends, validateFriends } = require("../../controllers/friends.controller");

router.get("/", validateUser, getAllFriends);
router.get("/validate", validateUser, validateFriends);

module.exports = router;
