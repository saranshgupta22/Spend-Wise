var _interopRequireWildcard =
  require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRing = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(
  require("react-native-reanimated"),
);
var _tokens = require("@/src/theme/tokens");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

var _Dimensions$get = _reactNative.Dimensions.get("window"),
  width = _Dimensions$get.width;
var size = width * 0.8;
var strokeWidth = 20;
var _worklet_17093820563704_init_data = {
  code: "function HealthRingTsx1(){const{pulse}=this.__closure;return{transform:[{scale:pulse.value}]};}",
  location:
    "/Users/agamghotra/Desktop/SPENDWISE/src/components/ui/HealthRing.tsx",
  sourceMap:
    '{"version":3,"names":["HealthRingTsx1","pulse","__closure","transform","scale","value"],"sources":["/Users/agamghotra/Desktop/SPENDWISE/src/components/ui/HealthRing.tsx"],"mappings":"AAgDyC,SAAAA,cAAMA,CAAA,QAAAC,KAAA,OAAAC,SAAA,CAC1C,MAAO,CACJC,SAAS,CAAE,CAAC,CAAEC,KAAK,CAAEH,KAAK,CAACI,KAAM,CAAC,CACrC,CAAC,CACJ","ignoreList":[]}',
};

var HealthRing = (exports.HealthRing = function HealthRing(_ref) {
  var spent = _ref.spent,
    budget = _ref.budget;
  var isOverspent = spent > budget;
  var pulse = (0, _reactNativeReanimated.useSharedValue)(1);

  (0, _react.useEffect)(
    function () {
      if (isOverspent) {
        pulse.value = (0, _reactNativeReanimated.withRepeat)(
          (0, _reactNativeReanimated.withSequence)(
            (0, _reactNativeReanimated.withTiming)(1.1, {
              duration: 500,
              easing: _reactNativeReanimated.Easing.inOut(
                _reactNativeReanimated.Easing.ease,
              ),
            }),
            (0, _reactNativeReanimated.withTiming)(1, {
              duration: 500,
              easing: _reactNativeReanimated.Easing.inOut(
                _reactNativeReanimated.Easing.ease,
              ),
            }),
          ),
          -1,
          true,
        );
      } else {
        pulse.value = (0, _reactNativeReanimated.withRepeat)(
          (0, _reactNativeReanimated.withSequence)(
            (0, _reactNativeReanimated.withTiming)(1.05, {
              duration: 2000,
              easing: _reactNativeReanimated.Easing.inOut(
                _reactNativeReanimated.Easing.ease,
              ),
            }),
            (0, _reactNativeReanimated.withTiming)(1, {
              duration: 2000,
              easing: _reactNativeReanimated.Easing.inOut(
                _reactNativeReanimated.Easing.ease,
              ),
            }),
          ),
          -1,
          true,
        );
      }
    },
    [isOverspent],
  );

  var animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function HealthRingTsx1Factory(_ref2) {
      var _worklet_17093820563704_init_data =
          _ref2._worklet_17093820563704_init_data,
        pulse = _ref2.pulse;
      var _e = [new global.Error(), -2, -27];
      var HealthRingTsx1 = function HealthRingTsx1() {
        return { transform: [{ scale: pulse.value }] };
      };
      HealthRingTsx1.__closure = { pulse: pulse };
      HealthRingTsx1.__workletHash = 17093820563704;
      HealthRingTsx1.__pluginVersion = "0.5.1";
      HealthRingTsx1.__initData = _worklet_17093820563704_init_data;
      HealthRingTsx1.__stackDetails = _e;
      return HealthRingTsx1;
    })({
      _worklet_17093820563704_init_data: _worklet_17093820563704_init_data,
      pulse: pulse,
    }),
  );

  return (0, _jsxRuntime.jsx)(_reactNative.View, {
    style: styles.container,
    children: (0, _jsxRuntime.jsx)(_reactNativeReanimated.default.View, {
      style: [
        styles.ring,
        {
          borderColor: isOverspent
            ? _tokens.SPATIAL_THEME.colors.bloodRed
            : _tokens.SPATIAL_THEME.colors.cyberBlue,
          shadowColor: isOverspent
            ? _tokens.SPATIAL_THEME.colors.bloodRed
            : _tokens.SPATIAL_THEME.colors.cyberBlue,
        },
        animatedStyle,
      ],
    }),
  });
});

var styles = _reactNative.StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    backgroundColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
});
