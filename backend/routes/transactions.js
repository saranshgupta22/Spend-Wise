const express = require("express");
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  getTransactionCount,
  deleteTransaction,
} = require("../controllers/transactionController");
const authenticate = require("../middleware/authenticate");

router.get("/get", authenticate, getTransactions);
router.get("/count", authenticate, getTransactionCount);
router.post("/add", authenticate, addTransaction);
router.delete("/:id", authenticate, deleteTransaction);

module.exports = router;
