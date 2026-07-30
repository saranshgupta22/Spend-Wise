Object.defineProperty(exports, "__esModule", { value: true });
exports.IconSymbol = IconSymbol;
var _expoSymbols = require("expo-symbols");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

function IconSymbol(_ref) {
  var name = _ref.name,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 24 : _ref$size,
    color = _ref.color,
    style = _ref.style,
    _ref$weight = _ref.weight,
    weight = _ref$weight === void 0 ? "regular" : _ref$weight;
  return (0, _jsxRuntime.jsx)(_expoSymbols.SymbolView, {
    weight: weight,
    tintColor: color,
    resizeMode: "scaleAspectFit",
    name: name,
    style: [
      {
        width: size,
        height: size,
      },
      style,
    ],
  });
}
