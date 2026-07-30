export const ALERT_FREQUENCY_OPTIONS = [
  {
    key: "daily",
    label: "Daily",
    description: "Uses your monthly budget divided by the number of days in this month.",
  },
  {
    key: "monthly",
    label: "Monthly",
    description: "Tracks spending against your full monthly budget.",
  },
  {
    key: "quarterly",
    label: "Quarterly",
    description: "Tracks spending against three months of budget.",
  },
  {
    key: "yearly",
    label: "Yearly",
    description: "Tracks spending against twelve months of budget.",
  },
];

const getDaysInMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getQuarter = (date) => Math.floor(date.getMonth() / 3);

export const buildBudgetSnapshot = ({
  transactions,
  monthlyTargetExpense,
  alertFrequency,
  now = new Date(),
}) => {
  const monthlyBudget = Number(monthlyTargetExpense) || 0;
  const frequency = alertFrequency || "monthly";
  const expenseTransactions = transactions.filter((tx) => tx.type === "expense");

  let spent = 0;
  let periodTarget = 0;
  let periodKey = "";
  let periodLabel = "";

  if (frequency === "daily") {
    const daysInMonth = getDaysInMonth(now);
    periodTarget = daysInMonth > 0 ? monthlyBudget / daysInMonth : 0;
    spent = expenseTransactions.reduce((total, tx) => {
      const txDate = new Date(tx.date);
      const sameDay =
        txDate.getDate() === now.getDate() &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear();
      return sameDay ? total + (Number(tx.amount) || 0) : total;
    }, 0);
    periodKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    periodLabel = "daily";
  } else if (frequency === "monthly") {
    periodTarget = monthlyBudget;
    spent = expenseTransactions.reduce((total, tx) => {
      const txDate = new Date(tx.date);
      const sameMonth =
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear();
      return sameMonth ? total + (Number(tx.amount) || 0) : total;
    }, 0);
    periodKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    periodLabel = "monthly";
  } else if (frequency === "quarterly") {
    periodTarget = monthlyBudget * 3;
    const quarter = getQuarter(now);
    spent = expenseTransactions.reduce((total, tx) => {
      const txDate = new Date(tx.date);
      const sameQuarter =
        getQuarter(txDate) === quarter &&
        txDate.getFullYear() === now.getFullYear();
      return sameQuarter ? total + (Number(tx.amount) || 0) : total;
    }, 0);
    periodKey = `${now.getFullYear()}-Q${quarter + 1}`;
    periodLabel = "quarterly";
  } else {
    periodTarget = monthlyBudget * 12;
    spent = expenseTransactions.reduce((total, tx) => {
      const txDate = new Date(tx.date);
      const sameYear = txDate.getFullYear() === now.getFullYear();
      return sameYear ? total + (Number(tx.amount) || 0) : total;
    }, 0);
    periodKey = `${now.getFullYear()}`;
    periodLabel = "yearly";
  }

  const percentUsed = periodTarget > 0 ? (spent / periodTarget) * 100 : 0;

  return {
    spent,
    periodTarget,
    periodKey,
    periodLabel,
    frequency,
    percentUsed,
    fiftyPercentAmount: periodTarget * 0.5,
    ninetyPercentAmount: periodTarget * 0.9,
  };
};

export const applyBudgetHealthPenalty = (baseScore, snapshot) => {
  const safeBaseScore = Number(baseScore) || 0;

  if (!snapshot?.periodTarget || snapshot.periodTarget <= 0) {
    return Math.max(0, Math.min(100, Math.round(safeBaseScore)));
  }

  if (snapshot.spent <= snapshot.periodTarget) {
    return Math.max(0, Math.min(100, Math.round(safeBaseScore)));
  }

  const overspendRatio =
    (snapshot.spent - snapshot.periodTarget) / snapshot.periodTarget;
  const penalty = Math.min(65, Math.round(overspendRatio * 100));

  return Math.max(0, Math.min(100, Math.round(safeBaseScore - penalty)));
};
