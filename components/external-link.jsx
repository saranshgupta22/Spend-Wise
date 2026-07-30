var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalLink = ExternalLink;
var _asyncToGenerator2 = _interopRequireDefault(
  require("@babel/runtime/helpers/asyncToGenerator"),
);
var _objectWithoutProperties2 = _interopRequireDefault(
  require("@babel/runtime/helpers/objectWithoutProperties"),
);
var _expoRouter = require("expo-router");
var _expoWebBrowser = require("expo-web-browser");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");
var _excluded = ["href"];

function ExternalLink(_ref) {
  var href = _ref.href,
    rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  return (0, _jsxRuntime.jsx)(
    _expoRouter.Link,
    Object.assign(
      {
        target: "_blank",
      },
      rest,
      {
        href: href,
        onPress: /*#__PURE__*/ (function () {
          var _ref2 = (0, _asyncToGenerator2.default)(function* (event) {
            if (true) {
              // Prevent the default behavior of linking to the default browser on native.
              event.preventDefault();
              // Open the link in an in-app browser.
              yield (0, _expoWebBrowser.openBrowserAsync)(href, {
                presentationStyle:
                  _expoWebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
              });
            }
          });
          return function (_x) {
            return _ref2.apply(this, arguments);
          };
        })(),
      },
    ),
  );
}
