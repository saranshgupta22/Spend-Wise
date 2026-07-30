require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_spendwise_key",
  JWT_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "30d",
};
