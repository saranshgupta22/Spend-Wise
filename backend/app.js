require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const transactionsRoutes = require("./routes/transactions");
const analyticsRoutes = require("./routes/analytics");
const subscriptionsRoutes = require("./routes/subscriptions");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/subscriptions", subscriptionsRoutes);

app.get("/health", (req, res) => res.json({ status: "OK" }));

module.exports = app;
