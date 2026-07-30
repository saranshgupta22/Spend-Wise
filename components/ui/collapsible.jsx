var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collapsible = Collapsible;
var _slicedToArray2 = _interopRequireDefault(
  require("@babel/runtime/helpers/slicedToArray"),
);
var _react = require("react");
var _reactNative = require("react-native");
var _themedText = require("@/components/themed-text");
var _themedView = require("@/components/themed-view");
var _iconSymbol = require("@/components/ui/icon-symbol");
var _theme = require("@/constants/theme");
var _useColorScheme2 = require("@/hooks/use-color-scheme");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

function Collapsible(_ref) {
  var _useColorScheme;
  var children = _ref.children,
    title = _ref.title;
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    isOpen = _useState2[0],
    setIsOpen = _useState2[1];
  var theme =
    (_useColorScheme = (0, _useColorScheme2.useColorScheme)()) != null
      ? _useColorScheme
      : "light";

  return (0, _jsxRuntime.jsxs)(_themedView.ThemedView, {
    children: [
      (0, _jsxRuntime.jsxs)(_reactNative.TouchableOpacity, {
        style: styles.heading,
        onPress: function onPress() {
          return setIsOpen(function (value) {
            return !value;
          });
        },
        activeOpacity: 0.8,
        children: [
          (0, _jsxRuntime.jsx)(_iconSymbol.IconSymbol, {
            name: "chevron.right",
            size: 18,
            weight: "medium",
            color:
              theme === "light"
                ? _theme.Colors.light.icon
                : _theme.Colors.dark.icon,
            style: { transform: [{ rotate: isOpen ? "90deg" : "0deg" }] },
          }),
          "",
          (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
            type: "defaultSemiBold",
            children: title,
          }),
        ],
      }),
      isOpen &&
        (0, _jsxRuntime.jsx)(_themedView.ThemedView, {
          style: styles.content,
          children: children,
        }),
    ],
  });
}

var styles = _reactNative.StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
