var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWave = HelloWave;
var _reactNativeReanimated = _interopRequireDefault(
  require("react-native-reanimated"),
);
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

function HelloWave() {
  return (0, _jsxRuntime.jsx)(_reactNativeReanimated.default.Text, {
    style: {
      fontSize: 28,
      lineHeight: 32,
      marginTop: -6,
      animationName: {
        "50%": { transform: [{ rotate: "25deg" }] },
      },
      animationIterationCount: 4,
      animationDuration: "300ms",
    },
    children: "\uD83D\uDC4B",
  });
}
