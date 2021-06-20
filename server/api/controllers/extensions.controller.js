const httpStatus = require("http-status");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("fast-csv");
const AWS = require("aws-sdk");

const { PSAors, PSAuth, PSEndpoint } = require("../models");

const bucket = new AWS.S3({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

const getUserExtensions = async (req, res, next) => {
  try {
    let extensions = await PSEndpoint.find({}).select("id");
    extensions = extensions.map((ext) => ext._id);
    return res.status(200).send({ data: extensions });
  } catch (error) {
    next(error, req, res);
  }
};

const uploadExtensions = async (req, res, next) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload a CSV file!");
    }
    let users = [];
    // eslint-disable-next-line no-undef
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
        try {
          let auths = [],
            endpoints = [],
            aors = [];
          auths = users.map((el) => {
            let plainText = el.name + ":" + "asterisk" + ":" + el.password;
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
          const fileContent = await fs.readFileSync(path);
          const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: req.user.extension,
            Body: fileContent,
            ACL: "public-read",
          };

          const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: req.user.extension,
          };

          try {
            await bucket.deleteObjects(deleteParams).promise();
          } catch (er) {
            // do nothing because
          }

          bucket.upload(s3Params, (err) => {
            if (err) {
              next(err, req, res);
            }

            fs.unlink(path, async function (err) {
              if (err) {
                next(err, req, res);
              }
              await session.commitTransaction();
              await session.endSession();
              return res.status(httpStatus.CREATED).send({
                success: true,
                message: "Data uploaded Successfully",
              });
            });
          });
        } catch (err) {
          next(err, req, res);
        }
      });
  } catch (error) {
    next(error, req, res);
  }
};

function getFile(params, file) {
  return new Promise((resolve, reject) => {
    const pipe = bucket.getObject(params).createReadStream().pipe(file);
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
    // eslint-disable-next-line no-undef
    __basedir + "/static/extensions/" + req.user.extension
  );
  await getFile(params, file);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `extension-${req.user.extension}.csv`
  );
  res.status(200).sendFile(
    // eslint-disable-next-line no-undef
    __basedir + "/static/extensions/" + req.user.extension,
    (error) => {
      if (error) {
        next(error, req, res);
      }
      fs.unlink(
        // eslint-disable-next-line no-undef
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
  getUserExtensions,
  getExtensions,
};
