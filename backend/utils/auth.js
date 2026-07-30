const crypto = require('crypto');

// Generate a 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate a secure refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate a secure token for password reset
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Calculate OTP expiry time (5 minutes from now)
const getOtpExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000);
};

// Rate limiting helper - simple in-memory store
const rateLimitStore = new Map();

const isRateLimited = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record) return false;
  
  if (now - record.windowStart > windowMs) {
    rateLimitStore.delete(key);
    return false;
  }
  
  return record.attempts >= maxAttempts;
};

const recordFailedAttempt = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  let record = rateLimitStore.get(key);
  
  if (!record || now - record.windowStart > windowMs) {
    record = { attempts: 1, windowStart: now };
  } else {
    record.attempts += 1;
  }
  
  rateLimitStore.set(key, record);
  
  if (rateLimitStore.size > 1000) {
    const cutoff = now - windowMs;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.windowStart < cutoff) rateLimitStore.delete(k);
    }
  }
};

const resetRateLimit = (key) => {
  rateLimitStore.delete(key);
};

module.exports = {
  generateOtp,
  generateRefreshToken,
  generateResetToken,
  getOtpExpiry,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
};
