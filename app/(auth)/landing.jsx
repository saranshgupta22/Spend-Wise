import { apiClient } from '@/src/api/client';
import { useAppStore } from '@/src/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  Layout,
} from 'react-native-reanimated';
import {
  ALERT_FREQUENCY_OPTIONS,
} from '@/src/utils/budgetAlerts';

// ─── Floating Label Input ──────────────────────────────────────────────────────
function FloatInput({
  label,
  val,
  setVal,
  secure = false,
  isPhone = false,
  isEmail = false,
  error,
  icon,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = val.length > 0;

  return (
    <View style={inputStyles.wrapper}>
      <View
        style={[
          inputStyles.container,
          focused && inputStyles.containerFocused,
          error && inputStyles.containerError,
        ]}
      >
        {icon && (
          <View style={inputStyles.iconWrap}>
            <Ionicons
              name={icon}
              size={18}
              color={focused ? '#6366F1' : '#475569'}
            />
          </View>
        )}
        <View style={inputStyles.fieldWrap}>
          <Animated.Text
            style={[
              inputStyles.floatLabel,
              (focused || hasValue) && inputStyles.floatLabelActive,
              focused && { color: '#6366F1' },
              error && { color: '#FB7185' },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            style={[inputStyles.input, (focused || hasValue) && { paddingTop: 16 }]}
            value={val}
            onChangeText={setVal}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={secure}
            keyboardType={isPhone ? 'number-pad' : isEmail ? 'email-address' : 'default'}
            keyboardAppearance="dark"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            placeholderTextColor="transparent"
            placeholder=" "
          />
        </View>
      </View>
      {error ? (
        <Animated.Text entering={FadeInDown.duration(200)} style={inputStyles.error}>
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 22, 40, 0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.18)',
    height: 60,
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  containerError: {
    borderColor: '#FB7185',
  },
  iconWrap: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingRight: 16,
  },
  floatLabel: {
    position: 'absolute',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#475569',
    top: '50%',
    marginTop: -10,
    transition: 'all 0.2s',
  },
  floatLabelActive: {
    fontSize: 11,
    top: 8,
    marginTop: 0,
    fontFamily: 'SpaceGrotesk_500Medium',
    letterSpacing: 0.5,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#F1F5F9',
    height: '100%',
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#FB7185',
    marginTop: 5,
    marginLeft: 4,
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const [captchaNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaNum2] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^\d{10}$/;
    if (!emailRegex.test(email)) newErrors.email = 'Invalid email format.';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!isLogin) {
      if (!firstName.trim()) newErrors.firstName = 'First name required.';
      if (!lastName.trim()) newErrors.lastName = 'Last name required.';
      if (!phoneRegex.test(phone)) newErrors.phone = 'Phone must be exactly 10 digits.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyCaptcha = () => {
    if (parseInt(captchaAnswer) === captchaNum1 + captchaNum2) {
      setCaptchaVerified(true);
      setErrors((p) => ({ ...p, captcha: null }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCaptchaVerified(false);
      setErrors((p) => ({ ...p, captcha: 'Verification failed. Try again.' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!isLogin && !captchaVerified) {
      setErrors((p) => ({ ...p, captcha: 'Please complete verification.' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setIsProcessing(true);
    try {
      let res;
      if (isLogin) {
        res = await apiClient.post('/auth/login', { email, password });
      } else {
        res = await apiClient.post('/auth/register', {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone || null,
        });
      }
      if (res.success) {
        setIsProcessing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 450);
        const { login } = useAppStore.getState();
        login(res.user?.phone_number || email, res.token, res.refreshToken);
        router.replace('/(tabs)');
      } else {
        setIsProcessing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors((p) => ({ ...p, form: res.error || 'Authentication failed' }));
      }
    } catch (_error) {
      setIsProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors((p) => ({ ...p, form: 'Network error. Please try again.' }));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#03040D', '#080B1C', '#03040D']}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.logoArea}>
            <LinearGradient
              colors={['rgba(99,102,241,0.2)', 'rgba(34,211,238,0.08)']}
              style={styles.logoRing}
            >
              <Ionicons name="wallet-outline" size={30} color="#6366F1" />
            </LinearGradient>
            <Text style={styles.wordmark}>SPENDWISE</Text>
            <Text style={styles.tagline}>Precision finance for the next generation</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Toggle */}
            <View style={styles.toggle}>
              {['Login', 'Sign Up'].map((label, i) => {
                const active = isLogin ? i === 0 : i === 1;
                return (
                  <Pressable
                    key={label}
                    style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                    onPress={() => { setIsLogin(i === 0); setErrors({}); }}
                  >
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Animated.View layout={Layout.springify()}>
              {!isLogin && (
                <Animated.View
                  entering={FadeIn.duration(280)}
                  exiting={FadeOutDown.duration(200)}
                >
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <FloatInput
                        label="First Name"
                        val={firstName}
                        setVal={setFirstName}
                        icon="person-outline"
                        error={errors.firstName}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FloatInput
                        label="Last Name"
                        val={lastName}
                        setVal={setLastName}
                        error={errors.lastName}
                      />
                    </View>
                  </View>
                  <FloatInput
                    label="Phone (10 digits)"
                    val={phone}
                    setVal={setPhone}
                    isPhone
                    icon="call-outline"
                    error={errors.phone}
                  />
                </Animated.View>
              )}

              <FloatInput
                label="Email Address"
                val={email}
                setVal={setEmail}
                isEmail
                icon="mail-outline"
                error={errors.email}
              />
              <FloatInput
                label="Password"
                val={password}
                setVal={setPassword}
                secure
                icon="lock-closed-outline"
                error={errors.password}
              />

              {errors.form ? (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.formError}>
                  <Ionicons name="alert-circle-outline" size={14} color="#FB7185" />
                  <Text style={styles.formErrorText}>{errors.form}</Text>
                </Animated.View>
              ) : null}

              {/* CAPTCHA */}
              {!isLogin && (
                <Animated.View entering={FadeInUp.delay(100)} style={styles.captchaCard}>
                  <Text style={styles.captchaLabel}>
                    Quick verification: {captchaNum1} + {captchaNum2} = ?
                  </Text>
                  <View style={styles.captchaRow}>
                    <TextInput
                      style={styles.captchaInput}
                      keyboardType="number-pad"
                      keyboardAppearance="dark"
                      placeholder="Answer"
                      placeholderTextColor="#475569"
                      value={captchaAnswer}
                      onChangeText={setCaptchaAnswer}
                      editable={!captchaVerified}
                    />
                    <Pressable
                      style={[styles.verifyBtn, captchaVerified && styles.verifyBtnDone]}
                      onPress={verifyCaptcha}
                      disabled={captchaVerified}
                    >
                      {captchaVerified ? (
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      ) : null}
                      <Text style={styles.verifyText}>
                        {captchaVerified ? 'Verified' : 'Verify'}
                      </Text>
                    </Pressable>
                  </View>
                  {errors.captcha ? (
                    <Text style={inputStyles.error}>{errors.captcha}</Text>
                  ) : null}
                </Animated.View>
              )}

              {/* Primary CTA */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && !isProcessing && { transform: [{ scale: 0.97 }] },
                  (!isLogin && !captchaVerified) && styles.primaryBtnDisabled,
                ]}
                onPress={handleAuth}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={['#6366F1', '#818CF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name={isLogin ? 'log-in-outline' : 'person-add-outline'}
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.primaryBtnText}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* OTP button */}
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <Ionicons name="phone-portrait-outline" size={16} color="#6366F1" />
                <Text style={styles.secondaryBtnText}>Continue with Phone OTP</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>
            Your data stays on device and is fully encrypted.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#03040D' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 40,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  wordmark: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 28,
    color: '#F1F5F9',
    letterSpacing: 4,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: 'Inter_300Light',
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.18)',
    overflow: 'hidden',
    padding: 22,
    backgroundColor: 'rgba(12, 14, 31, 0.9)',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 22,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
  },
  toggleText: {
    fontFamily: 'Inter_400Regular',
    color: '#475569',
    fontSize: 14,
  },
  toggleTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#818CF8',
  },
  row: { flexDirection: 'row', gap: 10 },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  formErrorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#FB7185',
  },
  captchaCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 14,
  },
  captchaLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  captchaRow: { flexDirection: 'row', gap: 10 },
  captchaInput: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#F1F5F9',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  verifyBtnDone: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  verifyText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#F1F5F9',
    letterSpacing: 0.5,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  primaryBtnGradient: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#334155',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    backgroundColor: 'rgba(99,102,241,0.06)',
    paddingVertical: 16,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#818CF8',
    letterSpacing: 0.2,
  },
  footer: {
    fontFamily: 'Inter_300Light',
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 0.2,
  },
});
