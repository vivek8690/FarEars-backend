const randomize = require("randomatic");

const { BCRYPT_SALT } = process.env;
const { OTPModel } = require("../models");
const bcrypt = require("bcrypt");
const { sendEmail } = require("./");

const sendOTPEmail = async (email) => {
  try{
    const otp = randomize("000000");
    let emailStatus = await sendEmail({
      to: email,
      subject: "FarEars Account Verification",
      html: `OTP For Account Verification is ${otp}`,
      text: otp,
    });

    if (emailStatus.accepted && emailStatus.accepted.indexOf(email) == -1) {
      throw new Error("Technical error while sending email, please try again.");
    }

    const dataToHash = `${otp}${email}`;
    let salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
    let hash = await bcrypt.hash(dataToHash, salt);

    await OTPModel.findOneAndUpdate(
      {
        email,
      },
      {
        otp: hash,
        email,
      },
      {
        new: true,
        upsert: true,
      }
    );
  }catch(err){
    throw err
  }

}

module.exports = {sendOTPEmail}
