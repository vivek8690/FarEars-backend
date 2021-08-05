const axios = require("axios");
const axiosNoFail = axios.create({
  validateStatus: function (status) {
    return status < 500;
  },
});

const checkForValidDialed = async (req, res, next) => {
  try{
    const to = req.query.to.split(",");
    const from = req.query.from;
    const response = await axiosNoFail.get("http://localhost:3000/api/friends/validate", {
      headers: { authorization: req.headers["authorization"] },
      params: { to: req.query.to.split(","), from: req.query.from },
    });
    req.user = response.data.user;
    req.friends = response.data.data;
    next();
  }catch(err){
    next(err);
  }

};

module.exports = { checkForValidDialed };
