const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middlewares");
const { getAllFriends } = require("../../controllers/friends.controller");

router.get("/", validateUser, getAllFriends);

module.exports = router;
