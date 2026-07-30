var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTransactionsDb =
  exports.insertTransactionDb =
  exports.deleteTransactionDb =
    void 0;
var _asyncToGenerator2 = _interopRequireDefault(
  require("@babel/runtime/helpers/asyncToGenerator"),
);
var _reactNative = require("react-native");

var isMocked = _reactNative.Platform.OS === "web";

var insertTransactionDb = (exports.insertTransactionDb =
  /*#__PURE__*/ (function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (tx) {
      if (isMocked) {
        console.log("Web mock: inserted tx", tx);
        return;
      }
      // Native sqlite would go here
    });
    return function insertTransactionDb(_x) {
      return _ref.apply(this, arguments);
    };
  })());

var deleteTransactionDb = (exports.deleteTransactionDb =
  /*#__PURE__*/ (function () {
    var _ref2 = (0, _asyncToGenerator2.default)(function* (id) {
      if (isMocked) {
        console.log("Web mock: deleted tx", id);
        return;
      }
    });
    return function deleteTransactionDb(_x2) {
      return _ref2.apply(this, arguments);
    };
  })());

var loadTransactionsDb = (exports.loadTransactionsDb =
  /*#__PURE__*/ (function () {
    var _ref3 = (0, _asyncToGenerator2.default)(function* () {
      if (isMocked) {
        return [];
      }
      return [];
    });
    return function loadTransactionsDb() {
      return _ref3.apply(this, arguments);
    };
  })());
