const { DataTypes } = require("sequelize");
const { sequelize } = require("../models");

const ensureUserProfileColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("Users");

  if (!table.daily_target_income) {
    await queryInterface.addColumn("Users", "daily_target_income", {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  }

  if (!table.monthly_target_expense) {
    await queryInterface.addColumn("Users", "monthly_target_expense", {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  }

  if (!table.alert_frequency) {
    await queryInterface.addColumn("Users", "alert_frequency", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "monthly",
    });
  }
};

module.exports = {
  ensureUserProfileColumns,
};
