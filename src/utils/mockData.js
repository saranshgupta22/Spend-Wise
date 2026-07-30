Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_HISTORY = void 0;

var generateMockTransactions = function generateMockTransactions() {
  var transactions = [];
  var now = new Date();
  var addTx = function addTx(daysAgo, hour, amount, title, category, type) {
    var isSubscription =
      arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    var isRecurring =
      arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    var d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, Math.floor(Math.random() * 60));
    transactions.push({
      id: Math.random().toString(36).substr(2, 9),
      amount: amount,
      title: title,
      category: category,
      type: type,
      isSubscription: isSubscription,
      isRecurring: isRecurring,
      date: d.toISOString(),
    });
  };

  // Recent Week
  addTx(1, 14, 250, "Starbucks", "Food", "expense");
  addTx(1, 19, 1200, "Zomato", "Food", "expense");
  addTx(2, 10, 5000, "Electricity Bill", "Utilities", "expense", false, true);
  addTx(3, 11, 150000, "Salary", "Income", "income", false, true);
  addTx(3, 15, 1200, "Nike Store", "Shopping", "expense");
  addTx(4, 9, 30, "Cashback - Groceries", "Rewards", "cashback");
  addTx(5, 20, 800, "Uber", "Transport", "expense");
  addTx(6, 12, 120, "Netflix", "Entertainment", "expense", true, true);

  // Recent Month
  addTx(12, 14, 4500, "Supermarket", "Groceries", "expense");
  addTx(15, 9, 400, "Spotify", "Entertainment", "expense", true, true);
  addTx(18, 19, 3500, "Dinner Date", "Food", "expense");
  addTx(25, 10, 200, "Cashback - Fuel", "Rewards", "cashback");
  addTx(28, 16, 2000, "Fuel", "Transport", "expense");

  // Older (Past Year)
  for (var i = 40; i < 360; i += 30) {
    addTx(i, 11, 150000, "Salary", "Income", "income", false, true);
    addTx(i + 2, 10, 15000, "Rent", "Housing", "expense", false, true);
    addTx(i + 5, 20, 3000, "Dining out", "Food", "expense");
    addTx(i + 15, 16, 2000, "Fuel", "Transport", "expense");
    addTx(i + 10, 8, 50, "Cashback", "Rewards", "cashback");
  }

  // Sort descending by date
  return transactions.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

var MOCK_HISTORY = (exports.MOCK_HISTORY = generateMockTransactions());
