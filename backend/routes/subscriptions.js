const express = require("express");
const router = express.Router();
const { getSubscriptions } = require("../controllers/subscriptionController");
const authenticate = require("../middleware/authenticate");

router.get("/", authenticate, getSubscriptions);

module.exports = router;
