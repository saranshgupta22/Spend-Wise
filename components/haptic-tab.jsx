var _interopRequireWildcard =
  require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HapticTab = HapticTab;
var _elements = require("@react-navigation/elements");
var Haptics = _interopRequireWildcard(require("expo-haptics"));
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

function HapticTab(props) {
  return (0, _jsxRuntime.jsx)(
    _elements.PlatformPressable,
    Object.assign({}, props, {
      onPressIn: function onPressIn(ev) {
        if (false) {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn == null || props.onPressIn(ev);
      },
    }),
  );
}
