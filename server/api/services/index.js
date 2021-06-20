const { TWILIO_SID, TWILIO_AUTH_TOKEN } = process.env;

const twilioClient = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);

const sendSMS = async (message, mobileNumber) => {
	let messageResp = await twilioClient.messages.create({
		body: message,
		messagingServiceSid: TWILIO_SID,
		to: mobileNumber,
	});
	return messageResp;
};

module.exports = {
	sendSMS,
};
