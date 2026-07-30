const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Category = require("./Category");

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  merchant: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  merchant_category: {
    type: DataTypes.STRING,
    allowNull: true, // From SMS logic
  },
  type: {
    type: DataTypes.ENUM("expense", "income", "transfer"),
    defaultValue: "expense",
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_cashback: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  raw_sms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Transaction;
