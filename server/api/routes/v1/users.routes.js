const express = require("express");
const router = express.Router();
const { isUserVerified } = require("../../middlewares/users.middleware");
const {
  registerUser,
  login,
  verifyAccount,
  sendVerificationEmail,
  manageInvite,
  allUsers,
  updateUserProfilePicture,
  fetchUserById,
  updateUserById
} = require("../../controllers/users.controller");

const { validateUser, upload } = require("../../middlewares");

const singleUpload = upload.single("image");

router.get("/", allUsers);

router.post("/register", registerUser);

router.post("/send-verification-email", isUserVerified, sendVerificationEmail);

router.post("/login", login);

router.post(
  "/upload",
  validateUser,
  function (req, res, next) {
    singleUpload(req, res, function (err) {
      if (err) {
        return res.status(422).send({
          errors: [{ title: "Image Upload Error", detail: err.message }],
        });
      }
      console.log(req);
      req.user.profile_picture = req.file && req.file.location;
      next();
    });
  },
  updateUserProfilePicture
);
router.patch("/:id",validateUser, updateUserById);
router.get("/:id", validateUser, fetchUserById);
router.post("/verify-account", verifyAccount);

module.exports = router;
