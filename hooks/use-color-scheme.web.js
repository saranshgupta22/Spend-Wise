var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColorScheme = useColorScheme;
var _slicedToArray2 = _interopRequireDefault(
  require("@babel/runtime/helpers/slicedToArray"),
);
var _react = require("react");
var _reactNative = require("react-native");

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
function useColorScheme() {
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    hasHydrated = _useState2[0],
    setHasHydrated = _useState2[1];

  (0, _react.useEffect)(function () {
    setHasHydrated(true);
  }, []);

  var colorScheme = (0, _reactNative.useColorScheme)();

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
