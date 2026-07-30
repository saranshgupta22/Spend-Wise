const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { normalizePhoneNumber } = require("../utils/phone");
const {
  generateOtp,
  generateRefreshToken,
  getOtpExpiry,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
} = require("../utils/auth");
const {
  hasTwilioConfig,
  sendOtpSms,
  verifyOtpCode,
} = require("../services/sms");
const { JWT_SECRET } = require("../config/jwt");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, phone_number: user.phone_number },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
};

const buildUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  phone_number: user.phone_number,
  name: user.name,
  first_name: user.first_name,
  last_name: user.last_name,
  daily_target_income: user.daily_target_income,
  monthly_target_expense: user.monthly_target_expense,
  alert_frequency: user.alert_frequency,
  is_verified: user.is_verified,
});

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone_number } = req.body;
    const normalizedPhone = phone_number
      ? normalizePhoneNumber(phone_number)
      : null;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (phone_number && !normalizedPhone) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          ...(normalizedPhone ? [{ phone_number: normalizedPhone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User already exists with this email or phone" });
    }

    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone_number: normalizedPhone,
      name:
        first_name && last_name
          ? `${first_name} ${last_name}`
          : first_name || last_name,
      is_verified: true,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    await user.update({ refresh_token: refreshToken });

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await user.update({
      refresh_token: refreshToken,
      last_login: new Date(),
    });

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

const sendOtp = async (req, res) => {
  try {
    if (!hasTwilioConfig) {
      return res.status(503).json({
        error: "SMS service is not configured on the server.",
        code: "SMS_NOT_CONFIGURED",
      });
    }

    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ error: "Phone number required" });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const rateKey = `otp:${normalizedPhone}`;
    if (isRateLimited(rateKey, 5, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: "Too many requests. Please try again after 15 minutes.",
        code: "RATE_LIMITED",
      });
    }

    let user = await User.findOne({ where: { phone_number: normalizedPhone } });
    if (!user) {
      user = await User.create({ phone_number: normalizedPhone });
    }

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();
    const delivery = await sendOtpSms({ phoneNumber: normalizedPhone, otp });

    if (delivery.provider === "twilio-verify") {
      await user.update({
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0,
      });
    } else {
      await user.update({
        otp_code: otp,
        otp_expires_at: otpExpiry,
        otp_attempts: 0,
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      phone_number: normalizedPhone,
      provider: delivery.provider,
      smsConfigured: hasTwilioConfig,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    if (error.code === 21212) {
      return res.status(500).json({
        error:
          "Invalid Twilio sender configuration. Use a Twilio-owned phone number in E.164 format or a Messaging Service SID.",
        code: "INVALID_TWILIO_SENDER",
      });
    }

    res.status(500).json({ error: error.message || "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp) {
      return res.status(400).json({ error: "Phone number and OTP required" });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const rateKey = `otp:${normalizedPhone}`;
    if (isRateLimited(`${rateKey}:verify`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: "Too many failed attempts. Please try again later.",
        code: "RATE_LIMITED",
      });
    }

    const user = await User.findOne({
      where: { phone_number: normalizedPhone },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const verifyResult = await verifyOtpCode({
      phoneNumber: normalizedPhone,
      otp,
    });

    if (verifyResult) {
      if (verifyResult.status !== "approved") {
        recordFailedAttempt(`${rateKey}:verify`, 10, 15 * 60 * 1000);
        return res
          .status(401)
          .json({ error: "Invalid OTP", code: "INVALID_OTP" });
      }
    } else {
      if (!user.otp_code || !user.otp_expires_at) {
        return res
          .status(400)
          .json({ error: "OTP not requested. Please request OTP first." });
      }

      if (new Date() > user.otp_expires_at) {
        await user.update({ otp_code: null, otp_expires_at: null });
        return res
          .status(400)
          .json({ error: "OTP expired. Please request a new one." });
      }

      if (user.otp_code !== otp) {
        const attempts = (user.otp_attempts || 0) + 1;
        await user.update({ otp_attempts: attempts });
        recordFailedAttempt(`${rateKey}:verify`, 10, 15 * 60 * 1000);

        const remainingAttempts = 5 - attempts;
        if (remainingAttempts > 0) {
          return res.status(401).json({
            error: "Invalid OTP",
            remainingAttempts,
          });
        }

        await user.update({
          otp_code: null,
          otp_expires_at: null,
          otp_attempts: 0,
        });

        return res.status(401).json({
          error: "Too many failed attempts. Please request a new OTP.",
          code: "MAX_ATTEMPTS_EXCEEDED",
        });
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
      is_verified: true,
      refresh_token: refreshToken,
      last_login: new Date(),
    });

    resetRateLimit(rateKey);
    resetRateLimit(`${rateKey}:verify`);

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        daily_target_income: user.daily_target_income,
        monthly_target_expense: user.monthly_target_expense,
        alert_frequency: user.alert_frequency,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const user = await User.findOne({ where: { refresh_token } });
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const tokens = generateTokens(user);
    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

const logout = async (req, res) => {
  try {
    await req.user.update({ refresh_token: null });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      phone_number: req.user.phone_number,
      name: req.user.name,
      daily_target_income: req.user.daily_target_income,
      monthly_target_expense: req.user.monthly_target_expense,
      alert_frequency: req.user.alert_frequency,
      is_verified: req.user.is_verified,
      expense_score: req.user.expense_score,
      last_login: req.user.last_login,
    },
  });
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone_number,
      daily_target_income,
      monthly_target_expense,
      alert_frequency,
    } = req.body;
    const updates = {};

    if (name !== undefined || phone_number !== undefined) {
      return res.status(400).json({
        error:
          "Name and mobile number are locked on this profile and cannot be changed from settings.",
      });
    }

    if (daily_target_income !== undefined) {
      const parsedTarget = Number(daily_target_income);
      if (Number.isNaN(parsedTarget) || parsedTarget < 0) {
        return res.status(400).json({
          error: "Daily target income must be a valid non-negative number",
        });
      }
      updates.daily_target_income = parsedTarget;
    }

    if (monthly_target_expense !== undefined) {
      const parsedExpenseTarget = Number(monthly_target_expense);
      if (Number.isNaN(parsedExpenseTarget) || parsedExpenseTarget < 0) {
        return res.status(400).json({
          error: "Monthly target expense must be a valid non-negative number",
        });
      }
      updates.monthly_target_expense = parsedExpenseTarget;
    }

    if (alert_frequency !== undefined) {
      if (
        !["daily", "monthly", "quarterly", "yearly"].includes(alert_frequency)
      ) {
        return res.status(400).json({ error: "Invalid alert frequency" });
      }
      updates.alert_frequency = alert_frequency;
    }

    await req.user.update(updates);
    await req.user.reload();

    res.json({
      success: true,
      user: {
        id: req.user.id,
        phone_number: req.user.phone_number,
        name: req.user.name,
        daily_target_income: req.user.daily_target_income,
        monthly_target_expense: req.user.monthly_target_expense,
        alert_frequency: req.user.alert_frequency,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  getMe,
  updateProfile,
};
