Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModalScreen;
var _expoRouter = require("expo-router");
var _reactNative = require("react-native");
var _themedText = require("@/components/themed-text");
var _themedView = require("@/components/themed-view");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

function ModalScreen() {
  return (0, _jsxRuntime.jsxs)(_themedView.ThemedView, {
    style: styles.container,
    children: [
      (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
        type: "title",
        children: "This is a modal",
      }),
      (0, _jsxRuntime.jsx)(_expoRouter.Link, {
        href: "/",
        dismissTo: true,
        style: styles.link,
        children: (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
          type: "link",
          children: "Go to home screen",
        }),
      }),
    ],
  });
}

var styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
