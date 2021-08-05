const express = require("express");
const router = express.Router();
const { inviteToBridge } = require("../services/originate");
const { checkForValidDialed } = require("../middlewares/validator");

router.get("/invite", checkForValidDialed, async (req, res) => {
  try {
    const to = req.query.to.split(",");
    const from = req.query.from;
    const callerId = `${req.user.first_name} ${req.user.last_name}`;
    const friends = req.friends;
    const fromUser = req.user;
    to.map(async (toExt) => {
      const toUser = req.friends.find(usr => usr.extension == toExt);
      await inviteToBridge(toUser, to.join("-"), fromUser);
    });
    res.send({
      list: "created",
    });
  } catch (err) {
    res.send({
      err: err,
    });
  }
});

router.get("/status", async (req, res) => {
  res.send({
    message: "Server is up and running",
  });
});

module.exports = router;
