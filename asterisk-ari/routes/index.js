const express = require("express");
const router = express.Router();
const { inviteToBridge } = require("../services/originate");

router.get("/invite", async (req, res) => {
  try{
    const to = req.query.to.split(',');
    const from = req.query.from;
    to.map(async (obj)=> {
      await inviteToBridge(obj, to.join('-'),from);
    })
    res.send({
      list: "created",
    });
  }catch(err){
    res.send({
      err: err,
    });
  }

});

router.get("/status", async (req, res) => {
  res.send({
    message: "Running",
  });
});

module.exports = router;
