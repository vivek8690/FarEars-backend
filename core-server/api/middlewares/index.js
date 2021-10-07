const { Users, Recording } = require("../models");
const { validateToken } = require("../utils");
const upload = require("./upload");

const validateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const authToken = authHeader && authHeader.split(" ")[1];
    if (!authToken) {
      return res
        .status(401)
        .send({ status: false, message: "No token provided." });
    }
    const tokenData = await validateToken(authToken);
    let user = await Users.findOne({ email: tokenData.email })
      .select("+password")
      .lean();

    if (user && user.email) {
      req.user = user;
      next();
    } else {
      return res
        .status(400)
        .send({ status: false, message: "User Not Found." });
    }
  } catch (error) {
    console.log(error);
    if (
      error.name == "JsonWebTokenError" ||
      error.name == "NotBeforeError" ||
      error.name == "TokenExpiredError"
    ) {
      return res.status(400).send({ status: false, message: "Invalid Token" });
    } else {
      return res
        .status(401)
        .send({ status: false, message: "User is not authenticated" });
    }
  }
};

const userHasAccess = async (req, res, next) => {
  try {
    let { id } = req.params;
    let recording = await Recording.findById(id).lean();
    if (
      recording.toUser === req.user.extension ||
      recording.fromUser === req.user.extension
    ) {
      console.log("inside if");
      req.recording = recording;
      next();
    }else{
      return res
        .status(400)
        .send({
          status: false,
          message: "You are not authorized for this operation",
        });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Something went wrong!" });
  }
};

module.exports = { validateUser, upload, userHasAccess };
