var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemedView = ThemedView;
var _objectWithoutProperties2 = _interopRequireDefault(
  require("@babel/runtime/helpers/objectWithoutProperties"),
);
var _reactNative = require("react-native");
var _useThemeColor = require("@/hooks/use-theme-color");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");
var _excluded = ["style", "lightColor", "darkColor"];

function ThemedView(_ref) {
  var style = _ref.style,
    lightColor = _ref.lightColor,
    darkColor = _ref.darkColor,
    otherProps = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var backgroundColor = (0, _useThemeColor.useThemeColor)(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (0, _jsxRuntime.jsx)(
    _reactNative.View,
    Object.assign(
      { style: [{ backgroundColor: backgroundColor }, style] },
      otherProps,
    ),
  );
}
