var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconSymbol = IconSymbol;
var _MaterialIcons = _interopRequireDefault(
  require("@expo/vector-icons/MaterialIcons"),
);
var _jsxRuntime = require("react-native-css-interop/jsx-runtime"); // Fallback for using MaterialIcons on Android and web.

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
var MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
function IconSymbol(_ref) {
  var name = _ref.name,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 24 : _ref$size,
    color = _ref.color,
    style = _ref.style;
  return (0, _jsxRuntime.jsx)(_MaterialIcons.default, {
    color: color,
    size: size,
    name: MAPPING[name],
    style: style,
  });
}
