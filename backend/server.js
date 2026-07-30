require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");
const { ensureUserProfileColumns } = require("./setup/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Plain sync: only creates tables that don't exist yet.
    // alter:true is avoided — it runs ALTER TABLE on every boot and
    // hits MySQL's 64-index limit on the Users table.
    await sequelize.sync();
    await ensureUserProfileColumns();
    await sequelize.sync();
    console.log("Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
