const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_ID } = process.env;

const twilioClient = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);

const sendSMS = async (message, mobileNumber) => {
	let messageResp = await twilioClient.messages.create({
		body: message,
		messagingServiceSid: TWILIO_SERVICE_ID,
		to: mobileNumber,
	});
	return messageResp;
};

module.exports = {
	sendSMS,
};
