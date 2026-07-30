const { Transaction } = require("../models");

const getAnalytics = async (req, res) => {
  try {
    const totalExpenses =
      (await Transaction.sum("amount", {
        where: { type: "expense", userId: req.user.id },
      })) || 0;
    const totalIncome =
      (await Transaction.sum("amount", {
        where: { type: "income", userId: req.user.id },
      })) || 0;
    const totalCashback =
      (await Transaction.sum("amount", {
        where: { is_cashback: true, userId: req.user.id },
      })) || 0;

    const netOutflow = Math.max(0, totalExpenses - totalCashback);
    const expenseScore =
      totalIncome > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round((1 - netOutflow / totalIncome) * 100 + 20),
            ),
          )
        : totalExpenses === 0
          ? 100
          : 35;
    const remainingBudget = Math.max(0, 150000 - totalExpenses);

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalIncome,
        totalCashback,
        remainingBudget,
        expenseScore,
        netFlow: totalIncome - netOutflow,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAnalytics,
};
