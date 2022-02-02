const AWS = require("aws-sdk");
const fileType = require("file-type");
const s3bucket = new AWS.S3({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

const s3bucketRecording = new AWS.S3({
  signatureVersion: "v4",
  accessKeyId: 'AKIATWCPMVWWHIPS37UF',
  secretAccessKey: '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',
  region: process.env.AWS_S3_BUCKET_REGION,
});

const getPresignedURL = (filename) => {
  try {
    if(filename.startsWith('/')){
      filename = filename.slice(1, filename.length);
    }
    const url = s3bucketRecording.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_RECORDING_BUCKET,
      Key: filename,
      Expires: 300,
    });
    return url;
  } catch (err) {
    throw err;
  }
};

module.exports = { s3bucket, getPresignedURL };
