const express = require("express");
const router = express.Router();
const userRoute = require("../v1/users.route");
const extensionsRoute = require("../v1/extensions.route");

router.get("/status", async (req, res) => {
  res.send({
    version: process.env.VERSION,
  });
});

router.use("/users", userRoute);
router.use("/extensions", extensionsRoute);

module.exports = router;
