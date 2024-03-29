const httpStatus = require("http-status");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("fast-csv");
const { s3bucket } = require("../services/s3.service");

const { PSAors, PSAuth, PSEndpoint, OTPModel, Users } = require("../models");

const uploadExtensions = async (req, res, next) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload a CSV file!");
    }
    let users = [];
    let path = __basedir + "/static/extensions/" + req.file.filename;
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        users.push(row);
      })
      .on("end", async () => {
        const session = await mongoose.startSession();
        await session.startTransaction();
        // try {
        let auths = [],
          endpoint = [],
          aors = [];
        auths = users.map((el) => {
          // console.log(el.extension);
          let plainText = el.extension + ":" + "asterisk" + ":" + el.extension;
          var md5Hash = crypto
            .createHash("md5")
            .update(plainText)
            .digest("hex");
          return {
            username: el.extension,
            md5_cred: md5Hash,
            _id: el.extension,
          };
        });
        aors = users.map((el) => {
          return {
            _id: el.extension,
          };
        });
        endpoints = users.map((el) => {
          return {
            aors: el.extension,
            _id: el.extension,
            auth: el.extension,
          };
        });

        await PSAuth.insertMany(auths);
        await PSAors.insertMany(aors);
        await PSEndpoint.insertMany(endpoints);
        //   const fileContent = await fs.readFileSync(path);
        //   const s3Params = {
        //     Bucket: process.env.AWS_S3_BUCKET,
        //     Key: req.user.extension,
        //     Body: fileContent,
        //     ACL: "public-read",
        //   };
        //
        //   const deleteParams = {
        //     Bucket: process.env.AWS_S3_BUCKET,
        //     Key: req.user.extension,
        //   };
        //
        //   try {
        //     let delData = await s3bucket.deleteObjects(deleteParams).promise();
        //   } catch (er) {
        //     // do nothing because
        //   }
        //
        //   s3bucket.upload(s3Params, (err, data) => {
        //     if (err) {
        //       next(err, req, res);
        //     }
        //
        //     fs.unlink(path, async function (err) {
        //       if (err) {
        //         next(err, req, res);
        //       }
        //       await session.commitTransaction();
        //       await session.endSession();
        //       return res.status(httpStatus.CREATED).send({
        //         success: true,
        //         message: "Data uploaded Successfully",
        //       });
        //     });
        //   });
        // } catch (err) {
        //   next(err, req, res);
        // }
        return res.status(httpStatus.CREATED).send({
          success: true,
          message: "Data uploaded Successfully",
        });
      });
  } catch (error) {
    next(error, req, res);
  }
};

function getFile(params, file) {
  return new Promise((resolve, reject) => {
    const pipe = s3bucket.getObject(params).createReadStream().pipe(file);
    pipe.on("error", reject);
    pipe.on("close", resolve);
  });
}

const getExtensions = async (req, res, next) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: req.user.extension,
  };
  const file = fs.createWriteStream(
    __basedir + "/static/extensions/" + req.user.extension
  );
  await getFile(params, file);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `extension-${req.user.extension}.csv`
  );
  res
    .status(200)
    .sendFile(
      __basedir + "/static/extensions/" + req.user.extension,
      (error) => {
        if (error) {
          next(error, req, res);
        }
        fs.unlink(
          __basedir + "/static/extensions/" + req.user.extension,
          (err) => {
            if (err) {
              console.log(err);
              next(err, req, res);
            }
          }
        );
      }
    );
};
module.exports = {
  uploadExtensions,
  getExtensions,
};
