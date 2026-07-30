const { Transaction } = require("../models");
const {
  classifyTransaction,
  extractMerchantFromSms,
} = require("../utils/transactionClassifier");

const addTransaction = async (req, res) => {
  try {
    const {
      amount,
      merchant,
      merchant_category,
      type,
      is_cashback,
      is_recurring,
      raw_sms,
    } = req.body;

    const derivedMerchant = merchant || extractMerchantFromSms(raw_sms);
    const derivedCategory =
      merchant_category ||
      classifyTransaction({ merchant: derivedMerchant, rawSms: raw_sms });

    const tx = await Transaction.create({
      amount,
      merchant: derivedMerchant,
      merchant_category: derivedCategory,
      type: type || "expense",
      is_cashback: is_cashback || false,
      is_recurring: is_recurring || false,
      raw_sms,
      userId: req.user.id,
    });

    res.json({ success: true, transaction: tx });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { all, limit = 50, offset = 0 } = req.query;
    const queryOptions = {
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      offset: Number(offset) || 0,
    };

    if (String(all) === "true") {
      delete queryOptions.limit;
    } else {
      queryOptions.limit = Number(limit) || 50;
    }

    const transactions = await Transaction.findAll(queryOptions);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTransactionCount = async (req, res) => {
  try {
    const count = await Transaction.count({ where: { userId: req.user.id } });
    res.json({ success: true, count });
  } catch (error) {
    console.error("Count transactions error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Transaction.destroy({
      where: { id, userId: req.user.id },
    });

    if (!deletedRows) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    res.json({ success: true, transactionId: id });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionCount,
  deleteTransaction,
};
