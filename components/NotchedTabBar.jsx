import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPATIAL_THEME } from '@/src/theme/tokens';

const BAR_HEIGHT = 68;

const TAB_ROUTES = [
  { name: 'index',     label: 'Home',    icon: 'grid',      iconOutline: 'grid-outline' },
  { name: 'ledger',    label: 'Ledger',  icon: 'list',      iconOutline: 'list-outline' },
  { name: 'ai',        label: 'Brain',   icon: 'planet',    iconOutline: 'planet-outline' },
  { name: 'analytics', label: 'Insights',icon: 'pie-chart', iconOutline: 'pie-chart-outline' },
];

function TabItem({ tab, isActive, onPress }) {
  // Animated values per tab
  const liftAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: isActive ? 1 : 0,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.85,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const translateY = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const pillOpacity = liftAnim;
  const pillScale = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const color = isActive ? SPATIAL_THEME.colors.indigo : SPATIAL_THEME.colors.text.muted;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.tabInner,
          { transform: [{ translateY }, { scale: scaleAnim }] },
        ]}
      >
        {/* Floating pill behind active icon */}
        <Animated.View
          style={[
            styles.activePill,
            { opacity: pillOpacity, transform: [{ scale: pillScale }] },
          ]}
        />

        <Ionicons
          name={isActive ? tab.icon : tab.iconOutline}
          size={22}
          color={color}
        />
        <Text style={[styles.tabLabel, { color, fontFamily: 'SpaceGrotesk_500Medium' }]}>{tab.label}</Text>
        {isActive && <View style={styles.activeIndicator} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function NotchedTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  const totalHeight = BAR_HEIGHT + bottomPad;

  const activeRouteName = state.routes[state.index]?.name;

  const handleTabPress = (routeName) => {
    Haptics.selectionAsync();
    const targetIndex = state.routes.findIndex((r) => r.name === routeName);
    if (targetIndex === -1) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[targetIndex].key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={[styles.wrapper, { height: totalHeight }]} pointerEvents="box-none">
      {/* Bar background */}
      <View style={StyleSheet.absoluteFill}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={52}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
        )}
        {/* Top border line */}
        <View style={styles.topBorder} />
      </View>

      {/* Tab row */}
      <View style={[styles.tabRow, { paddingBottom: bottomPad }]}>
        {TAB_ROUTES.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            isActive={activeRouteName === tab.name}
            onPress={() => handleTabPress(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible',
  },
  androidBackground: {
    backgroundColor: '#0A0C1A',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
    overflow: 'visible',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    overflow: 'visible',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    overflow: 'visible',
  },
  activePill: {
    position: 'absolute',
    top: -4,
    left: -8,
    right: -8,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366F1',
    marginTop: 1,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
});
