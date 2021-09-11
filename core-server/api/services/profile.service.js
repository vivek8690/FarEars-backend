const { Buffer } = require("buffer");
const axios = require("axios");
const { s3bucket } = require("./s3.service");

exports.uploadFromURL = async (name) => {
  try {
    const colorCodes = [
      "2d4059",
      "ea5455",
      "fddb3a",
      "776d8a",
      "d54062",
      "a35d6a",
      "006a71",
      "0f4c75",
      "ff5f40",
      "bd7af7",
    ];
    const randomColor = Math.floor(Math.random() * colorCodes.length);

    const url = `https://ui-avatars.com/api/?name=${name}&size=128&background=${colorCodes[randomColor]}&color=fff&bold=true`;

    // To download base64 image from URL
    const responseAxios = await axios(url, {
      responseType: "arraybuffer",
    });
    const bufferImage = `data:${
      responseAxios.headers["content-type"]
    };base64,${Buffer.from(responseAxios.data).toString("base64")}`;

    const buffer = Buffer.from(
      bufferImage.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = bufferImage.split(";")[0].split("/")[1];
    const key = `${
      process.env.NODE_ENV
    }/profile-${Date.now().toString()}.${type}`;

    const params = {
      Bucket: "critic-caller",
      Key: key,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
      ACL: "public-read",
    };

    const response = await new Promise((resolve, reject) => {
      s3bucket.upload(params, (err, data) =>
        err == null ? resolve(data) : reject(err)
      );
    });
    return response.Location;
  } catch (error) {
    console.log("Error while uploading file to s3bucket:", error, error.stack);
    throw error;
  }
};
