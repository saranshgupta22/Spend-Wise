Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAnalytics = void 0;

var SPATIAL_PALETTE = [
  "#00F0FF",
  "#00FF66",
  "#FF003C",
  "#BF30FF",
  "#FFF",
  "#999",
];

var DEFAULT_BUDGET_CAP = 150000;

var computeAnalytics = (exports.computeAnalytics = function computeAnalytics(
  transactions,
  filter,
) {
  var now = new Date();
  var filterThreshold = new Date(0);

  if (filter === "1W")
    ((filterThreshold = new Date(now)),
      filterThreshold.setDate(now.getDate() - 7));
  else if (filter === "1M")
    ((filterThreshold = new Date(now)),
      filterThreshold.setMonth(now.getMonth() - 1));
  else if (filter === "1Y")
    ((filterThreshold = new Date(now)),
      filterThreshold.setFullYear(now.getFullYear() - 1));

  var filtered = transactions.filter(function (t) {
    var txDate = new Date(t.date);
    return !Number.isNaN(txDate.getTime()) && txDate >= filterThreshold;
  });

  var totalSpent = 0;
  var totalIncome = 0;
  var totalCashback = 0;
  var categoryMap = {};
  var hourMap = {};
  var recurringExpenses = [];
  var subscriptions = [];

  filtered.forEach(function (tx) {
    var amount = Number(tx.amount) || 0;
    var category = tx.category || tx.merchant_category || tx.title || "Misc";

    if (tx.type === "income") {
      totalIncome += amount;
    } else if (tx.is_cashback || tx.type === "cashback") {
      totalCashback += amount;
    } else {
      totalSpent += amount;
      categoryMap[category] = (categoryMap[category] || 0) + amount;
      var hour = new Date(tx.date).getHours();
      if (!Number.isNaN(hour)) {
        hourMap[hour] = (hourMap[hour] || 0) + amount;
      }
      if (tx.is_recurring || tx.isRecurring) recurringExpenses.push(tx);
      if (tx.isSubscription || tx.is_subscription || tx.isRecurring)
        subscriptions.push(tx);
    }
  });

  var netOutflow = Math.max(0, totalSpent - totalCashback);
  var netFlow = totalIncome - netOutflow;
  var budgetRemaining = Math.max(0, DEFAULT_BUDGET_CAP - totalSpent);

  var efficiencyScore = 0;
  if (totalIncome > 0) {
    var ratio = netOutflow / totalIncome;
    efficiencyScore = Math.max(
      0,
      Math.min(100, Math.round((1 - ratio) * 100 + 20)),
    );
  } else {
    efficiencyScore = totalSpent === 0 ? 100 : 35;
  }

  var peakHour = 0;
  var maxSpentHourAmount = 0;
  Object.keys(hourMap).forEach(function (h) {
    var hourKey = parseInt(h, 10);
    if (hourMap[hourKey] > maxSpentHourAmount) {
      maxSpentHourAmount = hourMap[hourKey];
      peakHour = hourKey;
    }
  });

  var timeOfDay =
    peakHour >= 5 && peakHour < 12
      ? "Morning"
      : peakHour >= 12 && peakHour < 17
        ? "Afternoon"
        : peakHour >= 17 && peakHour < 21
          ? "Evening"
          : "Night";

  var categoryBreakdown = Object.keys(categoryMap)
    .map(function (cat, index) {
      return {
        name: cat,
        amount: categoryMap[cat],
        color: SPATIAL_PALETTE[index % SPATIAL_PALETTE.length],
        legendFontColor: "#FFF",
      };
    })
    .sort(function (a, b) {
      return b.amount - a.amount;
    });

  return {
    totalSpent: totalSpent,
    totalIncome: totalIncome,
    totalCashback: totalCashback,
    netFlow: netFlow,
    budgetRemaining: budgetRemaining,
    efficiencyScore: efficiencyScore,
    categoryBreakdown: categoryBreakdown,
    peakExpenseHour: peakHour,
    peakExpenseTimeOfDay: timeOfDay,
    recurringExpenses: recurringExpenses,
    subscriptions: subscriptions,
  };
});
