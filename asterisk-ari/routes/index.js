const express = require("express");
const router = express.Router();
const { inviteToBridge } = require("../services/originate");

router.get("/invite", async (req, res) => {
  const to = req.query.to.split(',');
	to.map(async (obj)=> {
		await inviteToBridge(obj, to.join('-'));
	})
  res.send({
    list: "created",
  });
});

router.get("/status", async (req, res) => {
  res.send({
    message: "Running",
  });
});

module.exports = router;
