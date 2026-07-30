var _interopRequireWildcard =
  require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ParallaxScrollView;
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(
  require("react-native-reanimated"),
);
var _themedView = require("@/components/themed-view");
var _useColorScheme2 = require("@/hooks/use-color-scheme");
var _useThemeColor = require("@/hooks/use-theme-color");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

var HEADER_HEIGHT = 250;
var _worklet_10316015760219_init_data = {
  code: "function parallaxScrollViewTsx1(){const{interpolate,scrollOffset,HEADER_HEIGHT}=this.__closure;return{transform:[{translateY:interpolate(scrollOffset.value,[-HEADER_HEIGHT,0,HEADER_HEIGHT],[-HEADER_HEIGHT/2,0,HEADER_HEIGHT*0.75])},{scale:interpolate(scrollOffset.value,[-HEADER_HEIGHT,0,HEADER_HEIGHT],[2,1,1])}]};}",
  location:
    "/Users/agamghotra/Desktop/SPENDWISE/components/parallax-scroll-view.tsx",
  sourceMap:
    '{"version":3,"names":["parallaxScrollViewTsx1","interpolate","scrollOffset","HEADER_HEIGHT","__closure","transform","translateY","value","scale"],"sources":["/Users/agamghotra/Desktop/SPENDWISE/components/parallax-scroll-view.tsx"],"mappings":"AA6B+C,SAAAA,sBAAMA,CAAA,QAAAC,WAAA,CAAAC,YAAA,CAAAC,aAAA,OAAAC,SAAA,CACjD,MAAO,CACLC,SAAS,CAAE,CACT,CACEC,UAAU,CAAEL,WAAW,CACrBC,YAAY,CAACK,KAAK,CAClB,CAAC,CAACJ,aAAa,CAAE,CAAC,CAAEA,aAAa,CAAC,CAClC,CAAC,CAACA,aAAa,CAAG,CAAC,CAAE,CAAC,CAAEA,aAAa,CAAG,IAAI,CAC9C,CACF,CAAC,CACD,CACEK,KAAK,CAAEP,WAAW,CAACC,YAAY,CAACK,KAAK,CAAE,CAAC,CAACJ,aAAa,CAAE,CAAC,CAAEA,aAAa,CAAC,CAAE,CAAC,CAAC,CAAE,CAAC,CAAE,CAAC,CAAC,CACtF,CAAC,CAEL,CAAC,CACH","ignoreList":[]}',
};

function ParallaxScrollView(_ref) {
  var _useColorScheme;
  var children = _ref.children,
    headerImage = _ref.headerImage,
    headerBackgroundColor = _ref.headerBackgroundColor;
  var backgroundColor = (0, _useThemeColor.useThemeColor)({}, "background");
  var colorScheme =
    (_useColorScheme = (0, _useColorScheme2.useColorScheme)()) != null
      ? _useColorScheme
      : "light";
  var scrollRef = (0, _reactNativeReanimated.useAnimatedRef)();
  var scrollOffset = (0, _reactNativeReanimated.useScrollOffset)(scrollRef);
  var headerAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function parallaxScrollViewTsx1Factory(_ref2) {
      var _worklet_10316015760219_init_data =
          _ref2._worklet_10316015760219_init_data,
        interpolate = _ref2.interpolate,
        scrollOffset = _ref2.scrollOffset,
        HEADER_HEIGHT = _ref2.HEADER_HEIGHT;
      var _e = [new global.Error(), -4, -27];
      var parallaxScrollViewTsx1 = function parallaxScrollViewTsx1() {
        return {
          transform: [
            {
              translateY: interpolate(
                scrollOffset.value,
                [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
              ),
            },
            {
              scale: interpolate(
                scrollOffset.value,
                [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                [2, 1, 1],
              ),
            },
          ],
        };
      };
      parallaxScrollViewTsx1.__closure = {
        interpolate: interpolate,
        scrollOffset: scrollOffset,
        HEADER_HEIGHT: HEADER_HEIGHT,
      };
      parallaxScrollViewTsx1.__workletHash = 10316015760219;
      parallaxScrollViewTsx1.__pluginVersion = "0.5.1";
      parallaxScrollViewTsx1.__initData = _worklet_10316015760219_init_data;
      parallaxScrollViewTsx1.__stackDetails = _e;
      return parallaxScrollViewTsx1;
    })({
      _worklet_10316015760219_init_data: _worklet_10316015760219_init_data,
      interpolate: _reactNativeReanimated.interpolate,
      scrollOffset: scrollOffset,
      HEADER_HEIGHT: HEADER_HEIGHT,
    }),
  );

  return (0, _jsxRuntime.jsxs)(_reactNativeReanimated.default.ScrollView, {
    ref: scrollRef,
    style: { backgroundColor: backgroundColor, flex: 1 },
    scrollEventThrottle: 16,
    children: [
      (0, _jsxRuntime.jsx)(_reactNativeReanimated.default.View, {
        style: [
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ],
        children: headerImage,
      }),
      (0, _jsxRuntime.jsx)(_themedView.ThemedView, {
        style: styles.content,
        children: children,
      }),
    ],
  });
}

var styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
