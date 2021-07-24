const express = require("express");
const router = express.Router();
const { validateUser } = require("../../middlewares");
const { inviteUser, manageInvite, getAllInvitations } = require("../../controllers/invite.controller");

router.get("/", validateUser, getAllInvitations);
router.post("/", validateUser, inviteUser);
router.post("/action", validateUser, manageInvite);

module.exports = router;
