var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemedText = ThemedText;
var _objectWithoutProperties2 = _interopRequireDefault(
  require("@babel/runtime/helpers/objectWithoutProperties"),
);
var _reactNative = require("react-native");
var _useThemeColor = require("@/hooks/use-theme-color");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");
var _excluded = ["style", "lightColor", "darkColor", "type"];

function ThemedText(_ref) {
  var style = _ref.style,
    lightColor = _ref.lightColor,
    darkColor = _ref.darkColor,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? "default" : _ref$type,
    rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var color = (0, _useThemeColor.useThemeColor)(
    { light: lightColor, dark: darkColor },
    "text",
  );

  return (0, _jsxRuntime.jsx)(
    _reactNative.Text,
    Object.assign(
      {
        style: [
          { color: color },
          type === "default" ? styles.default : undefined,
          type === "title" ? styles.title : undefined,
          type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
          type === "subtitle" ? styles.subtitle : undefined,
          type === "link" ? styles.link : undefined,
          style,
        ],
      },
      rest,
    ),
  );
}

var styles = _reactNative.StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
