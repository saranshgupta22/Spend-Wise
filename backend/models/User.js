const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    // unique removed: MySQL table has hit the 64-index limit.
    // Uniqueness enforced at application level in auth controller.
    validate: {
      isEmail: true,
    },
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
    // unique removed: MySQL table already has 64 indexes (the max).
    // Uniqueness is enforced in the auth controller before insert.
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expense_score: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  daily_target_income: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  monthly_target_expense: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  alert_frequency: {
    type: DataTypes.ENUM("daily", "monthly", "quarterly", "yearly"),
    defaultValue: "monthly",
  },
  otp_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  otp_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.compareOtp = function (candidateOtp) {
  if (!this.otp_code || !this.otp_expires_at) return false;
  if (new Date() > this.otp_expires_at) return false;
  return this.otp_code === candidateOtp;
};

module.exports = User;
