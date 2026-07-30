const BANK_RULES = [
  { label: "HDFC Bank", patterns: ["hdfc", "hdfc bank"] },
  { label: "ICICI Bank", patterns: ["icici", "icici bank"] },
  { label: "SBI", patterns: ["sbi", "state bank"] },
  { label: "Axis Bank", patterns: ["axis", "axis bank"] },
  { label: "Kotak", patterns: ["kotak", "kotak mahindra"] },
  { label: "Punjab National Bank", patterns: ["pnb", "punjab national"] },
  { label: "Bank of Baroda", patterns: ["bob", "bank of baroda"] },
  { label: "Canara Bank", patterns: ["canara"] },
  { label: "IDFC First", patterns: ["idfc"] },
  { label: "IndusInd", patterns: ["indusind"] },
  { label: "Yes Bank", patterns: ["yes bank"] },
  { label: "Paytm Payments Bank", patterns: ["paytm"] },
];

export const detectBankLabel = (transaction) => {
  const haystack = `${transaction?.raw_sms || ""} ${transaction?.merchant || ""} ${transaction?.title || ""}`
    .toLowerCase()
    .trim();

  for (const rule of BANK_RULES) {
    if (rule.patterns.some((pattern) => haystack.includes(pattern))) {
      return rule.label;
    }
  }

  if (haystack.includes("upi")) {
    return "UPI Linked Account";
  }

  return "Other Account";
};

export const buildBankwiseStats = (transactions) => {
  const expenseTransactions = transactions.filter((tx) => tx.type === "expense");
  const bankMap = new Map();
  const totalSpent = expenseTransactions.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0,
  );

  expenseTransactions.forEach((tx) => {
    const bank = detectBankLabel(tx);
    const amount = Number(tx.amount) || 0;
    const current = bankMap.get(bank) || {
      bank,
      spent: 0,
      count: 0,
      averageSpend: 0,
      shareOfSpend: 0,
      lastTransactionDate: null,
    };
    current.spent += amount;
    current.count += 1;
    current.lastTransactionDate = tx.date || current.lastTransactionDate;
    bankMap.set(bank, current);
  });

  return Array.from(bankMap.values())
    .map((bank) => ({
      ...bank,
      averageSpend: bank.count > 0 ? bank.spent / bank.count : 0,
      shareOfSpend: totalSpent > 0 ? (bank.spent / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.spent - a.spent)
    .map((bank, index) => ({
      ...bank,
      rank: index + 1,
    }));
};

export const buildHealthScoreReport = ({
  baseScore,
  adjustedScore,
  analytics,
  budgetSnapshot,
}) => {
  const reasons = [];
  const strengths = [];
  const alerts = [];
  const recommendations = [];
  const scoreDrop = Math.max(0, Math.round((baseScore || 0) - (adjustedScore || 0)));
  const safeAdjustedScore = Math.max(0, Math.min(100, Math.round(adjustedScore || 0)));
  const spent = Number(analytics?.totalSpent) || 0;
  const income = Number(analytics?.totalIncome) || 0;
  const cashback = Number(analytics?.totalCashback) || 0;
  const recurringCount = analytics?.recurringExpenses?.length || 0;
  const subscriptionsCount = analytics?.subscriptions?.length || 0;
  const budgetUsed = Number(budgetSnapshot?.percentUsed) || 0;

  if (analytics.netFlow < 0) {
    reasons.push(
      `Expenses are ahead of income by ₹${Math.abs(analytics.netFlow).toLocaleString()}.`,
    );
    alerts.push("Your current period is running cash-negative.");
    recommendations.push("Reduce non-essential spending or add income to restore positive flow.");
  } else if (income > 0) {
    strengths.push(
      `You still have ₹${Math.max(0, analytics.netFlow).toLocaleString()} of net inflow left after expenses.`,
    );
  }

  if (
    budgetSnapshot?.periodTarget > 0 &&
    budgetSnapshot.spent > budgetSnapshot.periodTarget
  ) {
    reasons.push(
      `You are over the ${budgetSnapshot.periodLabel} budget by ₹${(budgetSnapshot.spent - budgetSnapshot.periodTarget).toLocaleString()}.`,
    );
    alerts.push(`Budget usage is at ${Math.round(budgetUsed)}% for this ${budgetSnapshot.periodLabel} cycle.`);
    recommendations.push(`Cut back in the top spend categories until usage returns below 100%.`);
  } else if (budgetSnapshot?.periodTarget > 0) {
    strengths.push(
      `You have ₹${Math.max(0, budgetSnapshot.periodTarget - budgetSnapshot.spent).toLocaleString()} left in the ${budgetSnapshot.periodLabel} budget.`,
    );
  }

  if (cashback > 0) {
    strengths.push(`Cashback recovered ₹${cashback.toLocaleString()} from total outflow.`);
  }

  if (recurringCount > 0) {
    alerts.push(`${recurringCount} recurring expense${recurringCount > 1 ? "s are" : " is"} active in your history.`);
  }

  if (subscriptionsCount > 2) {
    recommendations.push("Review subscriptions and recurring payments for easy savings.");
  }

  if (spent === 0) {
    strengths.push("No expense activity has been tracked in the current window.");
  }

  if (!reasons.length && !strengths.length) {
    reasons.push("Spending is currently within the tracked limit.");
  }

  if (!recommendations.length) {
    recommendations.push("Maintain the current pace and keep monitoring weekly changes.");
  }

  const status =
    safeAdjustedScore >= 80
      ? "Strong"
      : safeAdjustedScore >= 60
        ? "Stable"
        : safeAdjustedScore >= 40
          ? "Watchlist"
          : "Critical";

  return {
    score: safeAdjustedScore,
    status,
    scoreDrop,
    reasons,
    strengths,
    alerts,
    recommendations,
    metrics: [
      {
        label: "Budget usage",
        value:
          budgetSnapshot?.periodTarget > 0
            ? `${Math.round(budgetUsed)}%`
            : "No target",
      },
      {
        label: "Net flow",
        value: `₹${Math.round(analytics?.netFlow || 0).toLocaleString()}`,
      },
      {
        label: "Recurring bills",
        value: String(recurringCount),
      },
      {
        label: "Cashback",
        value: `₹${Math.round(cashback).toLocaleString()}`,
      },
    ],
  };
};
