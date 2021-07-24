const isUserVerified = async (req, res, next) => {
  try {
    let { email } = req.body;
    let user = await Users.findOne({ email });
    if (user && user.is_verified) {
      return res.status(200).send({
        message: "You are already verified.",
        success: true,
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).send({
      message: "Error while verifiying user's status",
      success: false,
    });
  }
};

module.exports = { isUserVerified };
