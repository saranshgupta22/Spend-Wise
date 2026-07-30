Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeColor = useThemeColor;
var _theme = require("@/constants/theme");
var _useColorScheme2 = require("@/hooks/use-color-scheme");
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */ function useThemeColor(props, colorName) {
  var _useColorScheme;
  var theme =
    (_useColorScheme = (0, _useColorScheme2.useColorScheme)()) != null
      ? _useColorScheme
      : "light";
  var colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return _theme.Colors[theme][colorName];
  }
}
