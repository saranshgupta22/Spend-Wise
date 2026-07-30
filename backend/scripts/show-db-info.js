require("dotenv").config();
const { sequelize, Transaction } = require("../models");

const showDbInfo = async () => {
  try {
    await sequelize.authenticate();
    const config = sequelize.config || {};
    console.log("Connected to database:");
    console.log(`  dialect: ${config.dialect}`);
    console.log(`  host: ${config.host}`);
    console.log(`  port: ${config.port}`);
    console.log(`  database: ${config.database}`);
    console.log(`  username: ${config.username}`);
    console.log(`  table name: ${Transaction.getTableName()}`);

    const total = await Transaction.count();
    console.log(`\nTransaction row count: ${total}`);

    const userCounts = await Transaction.findAll({
      attributes: [
        "userId",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["userId"],
      raw: true,
    });

    console.log("\nTransactions by userId:");
    userCounts.forEach((row) => {
      console.log(`  userId=${row.userId || "NULL"} count=${row.count}`);
    });
  } catch (error) {
    console.error("Unable to connect or query database:");
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

showDbInfo();
