const DEFAULT_COUNTRY_CODE = process.env.OTP_DEFAULT_COUNTRY_CODE || "91";

const normalizePhoneNumber = (rawPhone) => {
  if (!rawPhone) return null;

  const trimmedPhone = String(rawPhone).trim();
  if (!trimmedPhone) return null;

  const hasLeadingPlus = trimmedPhone.startsWith("+");
  const digitsOnly = trimmedPhone.replace(/\D/g, "");
  if (!digitsOnly) return null;

  if (hasLeadingPlus) {
    return /^\d{8,15}$/.test(digitsOnly) ? `+${digitsOnly}` : null;
  }

  if (/^\d{10}$/.test(digitsOnly)) {
    return `+${DEFAULT_COUNTRY_CODE}${digitsOnly}`;
  }

  if (/^\d{8,15}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  return null;
};

module.exports = {
  normalizePhoneNumber,
};
