var _interopRequireDefault =
  require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabTwoScreen;
var _expoImage = require("expo-image");
var _reactNative = require("react-native");
var _collapsible = require("@/components/ui/collapsible");
var _externalLink = require("@/components/external-link");
var _parallaxScrollView = _interopRequireDefault(
  require("@/components/parallax-scroll-view"),
);
var _themedText = require("@/components/themed-text");
var _themedView = require("@/components/themed-view");
var _iconSymbol = require("@/components/ui/icon-symbol");
var _theme = require("@/constants/theme");
var _jsxRuntime = require("react-native-css-interop/jsx-runtime");

function TabTwoScreen() {
  return (0, _jsxRuntime.jsxs)(_parallaxScrollView.default, {
    headerBackgroundColor: { light: "#D0D0D0", dark: "#353636" },
    headerImage: (0, _jsxRuntime.jsx)(_iconSymbol.IconSymbol, {
      size: 310,
      color: "#808080",
      name: "chevron.left.forwardslash.chevron.right",
      style: styles.headerImage,
    }),
    children: [
      (0, _jsxRuntime.jsx)(_themedView.ThemedView, {
        style: styles.titleContainer,
        children: (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
          type: "title",
          style: {
            fontFamily: _theme.Fonts.rounded,
          },
          children: "Explore",
        }),
      }),
      (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
        children: "This app includes example code to help you get started.",
      }),
      (0, _jsxRuntime.jsxs)(_collapsible.Collapsible, {
        title: "File-based routing",
        children: [
          (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
            children: [
              "This app has two screens:",
              " ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "app/(tabs)/index.tsx",
              }),
              " and",
              " ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "app/(tabs)/explore.tsx",
              }),
            ],
          }),
          (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
            children: [
              "The layout file in ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "app/(tabs)/_layout.tsx",
              }),
              " ",
              "sets up the tab navigator.",
            ],
          }),
          (0, _jsxRuntime.jsx)(_externalLink.ExternalLink, {
            href: "https://docs.expo.dev/router/introduction",
            children: (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
              type: "link",
              children: "Learn more",
            }),
          }),
        ],
      }),
      (0, _jsxRuntime.jsx)(_collapsible.Collapsible, {
        title: "Android, iOS, and web support",
        children: (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
          children: [
            "You can open this project on Android, iOS, and the web. To open the web version, press",
            " ",
            (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
              type: "defaultSemiBold",
              children: "w",
            }),
            " in the terminal running this project.",
          ],
        }),
      }),
      (0, _jsxRuntime.jsxs)(_collapsible.Collapsible, {
        title: "Images",
        children: [
          (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
            children: [
              "For static images, you can use the ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "@2x",
              }),
              " and",
              " ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "@3x",
              }),
              " suffixes to provide files for different screen densities",
            ],
          }),
          (0, _jsxRuntime.jsx)(_expoImage.Image, {
            source: require("@/assets/images/react-logo.png"),
            style: { width: 100, height: 100, alignSelf: "center" },
          }),
          (0, _jsxRuntime.jsx)(_externalLink.ExternalLink, {
            href: "https://reactnative.dev/docs/images",
            children: (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
              type: "link",
              children: "Learn more",
            }),
          }),
        ],
      }),
      (0, _jsxRuntime.jsxs)(_collapsible.Collapsible, {
        title: "Light and dark mode components",
        children: [
          (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
            children: [
              "This template has light and dark mode support. The",
              " ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "useColorScheme()",
              }),
              " hook lets you inspect what the user's current color scheme is, and so you can adjust UI colors accordingly.",
            ],
          }),
          (0, _jsxRuntime.jsx)(_externalLink.ExternalLink, {
            href: "https://docs.expo.dev/develop/user-interface/color-themes/",
            children: (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
              type: "link",
              children: "Learn more",
            }),
          }),
        ],
      }),
      (0, _jsxRuntime.jsxs)(_collapsible.Collapsible, {
        title: "Animations",
        children: [
          (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
            children: [
              "This template includes an example of an animated component. The",
              " ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                children: "components/HelloWave.tsx",
              }),
              " component uses the powerful",
              " ",
              (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                type: "defaultSemiBold",
                style: { fontFamily: _theme.Fonts.mono },
                children: "react-native-reanimated",
              }),
              " ",
              "library to create a waving hand animation.",
            ],
          }),
          _reactNative.Platform.select({
            ios: (0, _jsxRuntime.jsxs)(_themedText.ThemedText, {
              children: [
                "The ",
                (0, _jsxRuntime.jsx)(_themedText.ThemedText, {
                  type: "defaultSemiBold",
                  children: "components/ParallaxScrollView.tsx",
                }),
                " ",
                "component provides a parallax effect for the header image.",
              ],
            }),
          }),
        ],
      }),
    ],
  });
}

var styles = _reactNative.StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
