const { Transaction } = require("../models");

const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Transaction.findAll({
      where: { is_recurring: true, userId: req.user.id },
    });
    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Subscriptions error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSubscriptions,
};
