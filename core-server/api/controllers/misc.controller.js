const forceUpdateVersion = '1.0.12';

const getForceUpdateVersion = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Force update version", version: forceUpdateVersion  });
  } catch (err) {
    next(err);
  }
};

module.exports = { getForceUpdateVersion };
