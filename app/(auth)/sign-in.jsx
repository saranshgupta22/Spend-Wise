import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useAppStore } from '@/src/store/useAppStore';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '@/src/api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// OTP Box — 6 individual character boxes
function OtpDisplay({ value }) {
  const boxes = Array(6).fill('');
  value.split('').forEach((ch, i) => { boxes[i] = ch; });

  return (
    <View style={otpStyles.row}>
      {boxes.map((ch, i) => (
        <View
          key={i}
          style={[
            otpStyles.box,
            ch.length > 0 && otpStyles.boxFilled,
            i === value.length && otpStyles.boxActive,
          ]}
        >
          <Text style={otpStyles.char}>{ch}</Text>
        </View>
      ))}
    </View>
  );
}

const otpStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 4 },
  box: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.18)',
    backgroundColor: 'rgba(19,22,40,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: 'rgba(99,102,241,0.55)',
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  boxActive: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  char: {
    fontFamily: 'Sora_700Bold',
    fontSize: 22,
    color: '#F1F5F9',
  },
});

export default function SignInScreen() {
  const login = useAppStore((state) => state.login);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hiddenInputRef = useRef(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const formatPhoneForApi = (value) => {
    const digits = value.replace(/[^0-9]/g, '');
    return digits.length === 10 ? `+91${digits}` : digits;
  };

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      const apiPhone = formatPhoneForApi(phoneNumber);
      const res = await apiClient.post('/auth/send-otp', { phone_number: apiPhone });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep(2);
        setCountdown(60);
        setNormalizedPhone(res.phone_number || apiPhone);
      } else {
        Alert.alert('Error', res.error || 'Failed to send OTP. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Network request failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-otp', {
        phone_number: normalizedPhone || formatPhoneForApi(phoneNumber),
        otp,
      });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        login(res.user?.phone_number || normalizedPhone || phoneNumber, res.token, res.refreshToken);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (res.remainingAttempts) {
          Alert.alert('Invalid OTP', `${res.error} (${res.remainingAttempts} attempts remaining)`);
        } else if (res.code === 'MAX_ATTEMPTS_EXCEEDED') {
          Alert.alert('Too Many Attempts', res.error);
          setStep(1);
          setOtp('');
        } else {
          Alert.alert('Error', res.error || 'Invalid OTP');
        }
        setOtp('');
      }
    } catch {
      Alert.alert('Error', 'Network request failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setOtp('');
    handleSendOtp();
  };

  const handleBack = () => {
    setStep(1);
    setOtp('');
    setCountdown(0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#03040D', '#080B1C', '#03040D']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#94A3B8" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <View style={styles.inner}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.header}>
            <LinearGradient
              colors={['rgba(16,185,129,0.2)', 'rgba(34,211,238,0.1)']}
              style={styles.iconBg}
            >
              <Ionicons name="phone-portrait-outline" size={26} color="#10B981" />
            </LinearGradient>
            <Text style={styles.title}>Phone Login</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Enter your registered mobile number'
                : `Code sent to +91 ${phoneNumber}`}
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

            {step === 1 ? (
              <Animated.View entering={SlideInRight.duration(300)} key="step1">
                {/* Phone input */}
                <View style={styles.phoneRow}>
                  <View style={styles.prefix}>
                    <Text style={styles.prefixText}>+91</Text>
                    <View style={styles.prefixDivider} />
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, '').slice(0, 10))}
                    placeholder="Phone number"
                    placeholderTextColor="#334155"
                    keyboardType="phone-pad"
                    keyboardAppearance="dark"
                    maxLength={10}
                    autoFocus
                  />
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(phoneNumber.length / 10) * 100}%` },
                    ]}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.ctaBtn,
                    phoneNumber.length < 10 && styles.ctaBtnDisabled,
                    pressed && phoneNumber.length === 10 && { transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={handleSendOtp}
                  disabled={phoneNumber.length < 10 || isLoading}
                >
                  <LinearGradient
                    colors={phoneNumber.length === 10 ? ['#10B981', '#22D3EE'] : ['#1e2035', '#1e2035']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaBtnGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.ctaText}>Send OTP</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ) : (
              <Animated.View entering={SlideInRight.duration(300)} key="step2">
                {/* Change number */}
                <Pressable style={styles.changeRow} onPress={handleBack}>
                  <Ionicons name="arrow-back-outline" size={16} color="#6366F1" />
                  <Text style={styles.changeText}>Change number</Text>
                </Pressable>

                {/* OTP visual boxes + hidden input */}
                <Pressable onPress={() => hiddenInputRef.current?.focus()} activeOpacity={1}>
                  <OtpDisplay value={otp} />
                </Pressable>

                <TextInput
                  ref={hiddenInputRef}
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  style={styles.hiddenInput}
                  caretHidden
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.ctaBtn,
                    otp.length < 6 && styles.ctaBtnDisabled,
                    pressed && otp.length === 6 && { transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length < 6 || isLoading}
                >
                  <LinearGradient
                    colors={otp.length === 6 ? ['#6366F1', '#818CF8'] : ['#1e2035', '#1e2035']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaBtnGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.ctaText}>Verify & Login</Text>
                        <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Resend */}
                <View style={styles.resendRow}>
                  {countdown > 0 ? (
                    <Text style={styles.resendCd}>Resend in {countdown}s</Text>
                  ) : (
                    <Pressable onPress={handleResendOtp}>
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </Pressable>
                  )}
                </View>
              </Animated.View>
            )}
          </Animated.View>

          <Text style={styles.note}>
            By continuing you agree to our Terms and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03040D' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  backText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  kav: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    justifyContent: 'center',
  },
  header: { marginBottom: 28, alignItems: 'flex-start' },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  title: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 28,
    color: '#F1F5F9',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.18)',
    overflow: 'hidden',
    padding: 22,
    backgroundColor: 'rgba(12,14,31,0.9)',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19,22,40,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    height: 60,
    marginBottom: 12,
    overflow: 'hidden',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  prefixText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#94A3B8',
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 12,
  },
  phoneInput: {
    flex: 1,
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    color: '#F1F5F9',
    paddingLeft: 12,
    height: '100%',
    letterSpacing: 1,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  ctaBtnGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  changeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#818CF8',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  resendRow: { alignItems: 'center', marginTop: 16 },
  resendCd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#334155',
  },
  resendLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#10B981',
  },
  note: {
    fontFamily: 'Inter_300Light',
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.2,
  },
});
