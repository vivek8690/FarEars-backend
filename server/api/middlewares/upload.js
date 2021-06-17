const multer = require("multer");

const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb("Please upload only csv file.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/static/extensions/");
  },
  filename: (req, file, cb) => {
    let userName = req.user.extension;
    let fileName = `${Date.now()}-${userName}-${file.originalname}`;
    req.fileName = fileName;
    cb(null, fileName);
  },
});

const uploadFile = multer({
  storage: storage,
  fileFilter: csvFilter,
});

module.exports = {
  uploadFile,
};
