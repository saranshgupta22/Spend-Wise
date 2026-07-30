import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const SLIDES = [
  {
    key: 'track',
    image: require('../../assets/images/onboard1.png'),
    tag: 'AUTOMATIC TRACKING',
    headline: 'Every rupee,\naccounted for.',
    body: 'SpendWise reads your bank SMS messages and instantly logs transactions — no manual entry needed.',
    accent: '#6366F1',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    key: 'ai',
    image: require('../../assets/images/onboard2.png'),
    tag: 'AI POWERED',
    headline: 'Smart insights,\ninstantly.',
    body: 'Our AI engine categorizes spending, detects patterns, and gives you actionable recommendations in real time.',
    accent: '#10B981',
    glow: 'rgba(16,185,129,0.25)',
  },
  {
    key: 'health',
    image: require('../../assets/images/onboard3.png'),
    tag: 'BUDGET HEALTH',
    headline: 'Stay in control,\nalways.',
    body: 'Set monthly budgets, get smart alerts, and track your financial health score as you spend.',
    accent: '#22D3EE',
    glow: 'rgba(34,211,238,0.25)',
  },
];

function SlideItem({ item, index, scrollX }) {
  const animStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * W, index * W, (index + 1) * W],
      [0.3, 1, 0.3],
    );
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * W, index * W, (index + 1) * W],
      [0.88, 1, 0.88],
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.slide, animStyle]}>
      {/* Glow orb behind image */}
      <View style={[styles.glowOrb, { backgroundColor: item.glow }]} />

      <Image source={item.image} style={styles.illustration} resizeMode="contain" />

      <View style={styles.textBlock}>
        {/* Chip tag */}
        <Animated.View
          entering={FadeIn.delay(200)}
          style={[styles.chip, { borderColor: item.accent }]}
        >
          <View style={[styles.chipDot, { backgroundColor: item.accent }]} />
          <Text style={[styles.chipText, { color: item.accent }]}>{item.tag}</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.headline}>
          {item.headline}
        </Animated.Text>

        {/* Body */}
        <Animated.Text entering={FadeInUp.delay(180).springify()} style={styles.body}>
          {item.body}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

function Dot({ index, scrollX }) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
    const width = interpolate(scrollX.value, inputRange, [6, 24, 6], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], 'clamp');
    return { width, opacity };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const handleMomentumEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setCurrentIndex(idx);
  };

  const markSeenAndNavigate = async (destination) => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace(destination);
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      markSeenAndNavigate('/(auth)/landing');
    }
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    markSeenAndNavigate('/(auth)/landing');
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const accent = SLIDES[currentIndex].accent;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#03040D', '#080B1C', '#03040D']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip */}
      <Pressable
        style={[styles.skipBtn, { top: insets.top + 12 }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slides */}
      <AnimatedFlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
        )}
      />

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.ctaBtn,
            { backgroundColor: accent, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.ctaText}>
            {isLast ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03040D',
  },
  skipBtn: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(148, 163, 184, 0.8)',
    letterSpacing: 0.2,
  },
  slide: {
    width: W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
  },
  glowOrb: {
    position: 'absolute',
    top: H * 0.05,
    width: W * 0.75,
    height: W * 0.75,
    borderRadius: W * 0.375,
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  illustration: {
    width: W * 0.78,
    height: W * 0.78,
    marginBottom: 12,
  },
  textBlock: {
    width: '100%',
    paddingTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  chipText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  headline: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 34,
    color: '#F1F5F9',
    lineHeight: 42,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  controls: {
    paddingHorizontal: 28,
    gap: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  ctaBtn: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
