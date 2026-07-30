const twilio = require("twilio");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID?.trim();
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN?.trim();
const TWILIO_VERIFY_SERVICE_SID =
  process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
const isVerifyServiceSid = (value) => /^VA[0-9a-fA-F]{32}$/.test(value || "");

const hasTwilioConfig = Boolean(
  TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    isVerifyServiceSid(TWILIO_VERIFY_SERVICE_SID),
);

const twilioClient = hasTwilioConfig
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

const sendOtpSms = async ({ phoneNumber, otp }) => {
  if (!twilioClient) {
    throw new Error(
      "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
    );
  }

  await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: "sms",
    });

  return { provider: "twilio-verify" };
};

const verifyOtpCode = async ({ phoneNumber, otp }) => {
  if (!twilioClient) {
    throw new Error(
      "SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
    );
  }

  const verificationCheck = await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: otp,
    });

  return verificationCheck;
};

module.exports = {
  sendOtpSms,
  hasTwilioConfig,
  verifyOtpCode,
};
