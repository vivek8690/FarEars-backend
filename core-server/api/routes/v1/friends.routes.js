const express = require("express");
const router = express.Router();
const { validateUser, userHasAccess } = require("../../middlewares");
const {
  getAllFriends,
  validateFriends,
  getAllRecents,
  getAllRecordings,
  createRecording,
  getRecordingSignedURL,
} = require("../../controllers/friends.controller");

router.get("/", validateUser, getAllFriends);
router.get("/recents", validateUser, getAllRecents);
router.get("/validate", validateUser, validateFriends);
router.get("/recordings", validateUser, getAllRecordings);
router.get("/recordings/:id", validateUser, userHasAccess, getRecordingSignedURL);
router.post("/recordings", createRecording);

module.exports = router;
