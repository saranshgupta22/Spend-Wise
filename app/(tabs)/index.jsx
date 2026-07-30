import { THEME } from "@/constants/theme";
import { HealthRing } from "@/src/components/ui/HealthRing";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useAppStore } from "@/src/store/useAppStore";
import { computeAnalytics } from "@/src/utils/analyticsEngine";
import {
  ALERT_FREQUENCY_OPTIONS,
  applyBudgetHealthPenalty,
  buildBudgetSnapshot,
} from "@/src/utils/budgetAlerts";
import {
  buildBankwiseStats,
  buildHealthScoreReport,
} from "@/src/utils/homeInsights";
import {
  loadProfileBudgetSettings,
  mergeProfileBudgetSettings,
  saveProfileBudgetSettings,
} from "@/src/utils/profileBudgetSettings";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { apiClient } from "@/src/api/client";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Animated, {
    Easing,
    FadeInUp,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function CommandCenter() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const balance = useAppStore((state) => state.balance);
  const budgetCap = useAppStore((state) => state.budgetCap);
  const transactions = useAppStore((state) => state.transactions);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const animatedBalance = useSharedValue(0);

  const analytics = useMemo(
    () => computeAnalytics(transactions, "1M"),
    [transactions],
  );
  const [activeChartAmount, setActiveChartAmount] = useState(0);
  const [activeChartLabel, setActiveChartLabel] = useState("Portfolio");
  const [healthScore, setHealthScore] = useState(100);
  const [aiInsight, setAiInsight] = useState(
    "Analyzing your spending portfolio...",
  );
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [monthlyTargetExpense, setMonthlyTargetExpense] = useState("");
  const [alertFrequency, setAlertFrequency] = useState("monthly");

  useTransactions();

  const grossInflow = analytics.totalIncome + analytics.totalCashback;
  const transactionLiquidity = Math.max(0, grossInflow - analytics.totalSpent);
  const displayLiquidity =
    transactions.length > 0 ? transactionLiquidity : balance;
  const ringBudget = transactions.length > 0 ? Math.max(grossInflow, 1) : budgetCap;
  const ringSpent =
    transactions.length > 0
      ? analytics.totalSpent
      : Math.max(0, budgetCap - balance);

  const chartData = useMemo(
    () =>
      analytics.categoryBreakdown.length
        ? analytics.categoryBreakdown.map((cat) => ({
            value: cat.amount,
            color: cat.color,
            text: cat.name,
            legendFontColor: "#FFF",
          }))
        : [
            {
              value: 15400,
              color: THEME.colors.primary,
              gradientCenterColor: THEME.colors.secondary,
              focused: true,
            },
            {
              value: 6200,
              color: THEME.colors.danger,
              gradientCenterColor: "#8B00FF",
            },
            {
              value: 3400,
              color: THEME.colors.success,
              gradientCenterColor: THEME.colors.secondary,
            },
            {
              value: 8900,
              color: THEME.colors.textSecondary,
              gradientCenterColor: THEME.colors.surface,
            },
          ],
    [analytics.categoryBreakdown],
  );

  const alertBudgetSnapshot = useMemo(
    () =>
      buildBudgetSnapshot({
        transactions,
        monthlyTargetExpense: user?.monthly_target_expense,
        alertFrequency: user?.alert_frequency,
      }),
    [transactions, user?.alert_frequency, user?.monthly_target_expense],
  );

  const profilePreviewSnapshot = useMemo(
    () =>
      buildBudgetSnapshot({
        transactions,
        monthlyTargetExpense: monthlyTargetExpense,
        alertFrequency,
      }),
    [alertFrequency, monthlyTargetExpense, transactions],
  );
  const bankwiseStats = useMemo(
    () => buildBankwiseStats(transactions),
    [transactions],
  );
  const topBankwiseStats = useMemo(() => bankwiseStats.slice(0, 4), [bankwiseStats]);
  const adjustedHealthScore = useMemo(
    () => applyBudgetHealthPenalty(analytics.efficiencyScore, alertBudgetSnapshot),
    [alertBudgetSnapshot, analytics.efficiencyScore],
  );
  const healthScoreReport = useMemo(
    () =>
      buildHealthScoreReport({
        baseScore: analytics.efficiencyScore,
        adjustedScore: adjustedHealthScore,
        analytics,
        budgetSnapshot: alertBudgetSnapshot,
      }),
    [adjustedHealthScore, alertBudgetSnapshot, analytics],
  );

  useEffect(() => {
    if (transactions.length > 0) {
      setHealthScore(adjustedHealthScore);
      if (
        alertBudgetSnapshot.periodTarget > 0 &&
        alertBudgetSnapshot.spent > alertBudgetSnapshot.periodTarget
      ) {
        setAiInsight(
          `Budget alert: you are over your ${alertBudgetSnapshot.periodLabel} limit by ₹${(alertBudgetSnapshot.spent - alertBudgetSnapshot.periodTarget).toLocaleString()}. Health score has been reduced.`,
        );
      } else {
        setAiInsight(
        analytics.netFlow >= 0
          ? `Available liquidity is ₹${displayLiquidity.toLocaleString()} after booking all income and expenses.`
          : `Expenses are ahead by ₹${Math.abs(analytics.netFlow).toLocaleString()}. Add income or review the ledger.`,
        );
      }
    } else {
      setAiInsight("Start adding transactions for personalized insights.");
      setHealthScore(adjustedHealthScore);
    }

    animatedBalance.value = withTiming(displayLiquidity, {
      duration: 1500,
      easing: Easing.out(Easing.exp),
    });

    const sum = chartData.reduce((acc, curr) => acc + curr.value, 0);
    setActiveChartAmount(sum);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [
    adjustedHealthScore,
    alertBudgetSnapshot,
    analytics,
    animatedBalance,
    chartData,
    displayLiquidity,
    transactions.length,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const res = await apiClient.get("/auth/me");
      const localBudgetSettings = await loadProfileBudgetSettings();

      if (!isMounted || !res.success || !res.user) return;

      const mergedUser = mergeProfileBudgetSettings(
        res.user,
        localBudgetSettings,
      );

      setUser(mergedUser);
      setProfileName(mergedUser.name || "");
      setProfilePhone(mergedUser.phone_number || "");
      setMonthlyTargetExpense(
        mergedUser.monthly_target_expense
          ? String(mergedUser.monthly_target_expense)
          : "",
      );
      setAlertFrequency(mergedUser.alert_frequency || "monthly");
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  useEffect(() => {
    if (!user) return;

    setProfileName(user.name || "");
    setProfilePhone(user.phone_number || "");
    setMonthlyTargetExpense(
      user.monthly_target_expense ? String(user.monthly_target_expense) : "",
    );
    setAlertFrequency(user.alert_frequency || "monthly");
  }, [user]);

  const handleAddIncome = async () => {
    const normalizedAmount = Number(incomeAmount);

    if (!normalizedAmount) return;

    try {
      const res = await apiClient.post("/transactions/add", {
        amount: normalizedAmount,
        merchant: incomeSource || "Income Entry",
        merchant_category: "Income",
        type: "income",
      });

      if (res.success) {
        addTransaction({
          id: res.transaction.id,
          title: res.transaction.merchant || "Income Entry",
          merchant: res.transaction.merchant || "Income Entry",
          amount: normalizedAmount,
          category: res.transaction.merchant_category || "Income",
          type: "income",
          is_cashback: false,
          is_recurring: Boolean(
            res.transaction.is_recurring || res.transaction.isRecurring,
          ),
          raw_sms: res.transaction.raw_sms || "",
          date: new Date(res.transaction.date || Date.now()).toISOString(),
        });

        setIncomeAmount("");
        setIncomeSource("");
        setShowIncomeModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log("[Income Entry Error]", error);
    }
  };

  const handleSaveProfile = async () => {
    const parsedTarget = Number(monthlyTargetExpense || 0);

    if (Number.isNaN(parsedTarget) || parsedTarget < 0) {
      Alert.alert("Invalid Target", "Please enter a valid monthly target expense.");
      return;
    }

    const payload = {
      monthly_target_expense: parsedTarget,
      alert_frequency: alertFrequency,
    };

    const res = await apiClient.put("/auth/profile", payload);

    if (!res.success || !res.user) {
      Alert.alert("Save Failed", res.error || "Unable to update profile.");
      return;
    }

    await saveProfileBudgetSettings({
      monthly_target_expense: parsedTarget,
      alert_frequency: alertFrequency,
    });

    const refreshedProfile = await apiClient.get("/auth/me");
    const serverUser =
      refreshedProfile.success && refreshedProfile.user
        ? refreshedProfile.user
        : res.user;
    const nextUser = mergeProfileBudgetSettings(serverUser, {
      monthly_target_expense: parsedTarget,
      alert_frequency: alertFrequency,
    });

    setUser(nextUser);
    useAppStore.setState({ userPhone: nextUser.phone_number || null });
    setShowProfileModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = async () => {
    await apiClient.post("/auth/logout", {});
    await logout();
    setShowProfileModal(false);
    router.replace("/(auth)/landing");
  };

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `₹${animatedBalance.value.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`,
      defaultValue: `₹${animatedBalance.value.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`,
    };
  });

  const handlePiePress = (item) => {
    Haptics.selectionAsync();
    setActiveChartAmount(item.value);
    setActiveChartLabel(item.text || item.name || "Category");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        className="max-w-4xl mx-auto w-full"
      >
        <View style={styles.header}>
          <Text style={styles.dateLabel}>SPENDWISE</Text>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setShowProfileModal(true);
            }}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={THEME.colors.textSecondary}
            />
          </Pressable>
        </View>

        <Animated.View
          style={styles.heroSection}
          entering={FadeInUp.delay(50).springify()}
        >
          <View style={styles.biometricRing}>
            <HealthRing
              spent={ringSpent}
              budget={ringBudget}
              color={THEME.colors.secondary}
            />
            <View style={styles.balanceOverlay}>
              <Text style={styles.balanceLabel}>Net Liquidity</Text>
              <AnimatedTextInput
                underlineColorAndroid="transparent"
                editable={false}
                value={`₹${displayLiquidity.toLocaleString()}`}
                animatedProps={animatedProps}
                style={styles.heroBalance}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.quickActionHub}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowIncomeModal(true);
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { transform: [{ scale: 0.97 }] },
              { backgroundColor: THEME.colors.surfaceGlass }, // Re-enforcing glass against midnight
            ]}
          >
            <Ionicons
              name="arrow-down-outline"
              size={20}
              color={THEME.colors.secondary}
            />
            <Text style={styles.actionText}>Add Income</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.insightGrid}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/bankwise");
            }}
            style={({ pressed }) => [
              styles.insightCardPressable,
              pressed && styles.cardPressed,
            ]}
          >
            <BlurView intensity={28} tint="dark" style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.bentoTitle}>BANK-WISE SPEND</Text>
                <View style={styles.insightHeaderActions}>
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={THEME.colors.secondary}
                  />
                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={THEME.colors.textSecondary}
                  />
                </View>
              </View>
              {topBankwiseStats.length > 0 ? (
                topBankwiseStats.map((bank) => (
                  <View key={bank.bank} style={styles.insightRow}>
                    <View>
                      <Text style={styles.insightPrimary}>{bank.bank}</Text>
                      <Text style={styles.insightSecondary}>
                        {bank.count} transaction{bank.count > 1 ? "s" : ""} • {Math.round(bank.shareOfSpend)}% of spend
                      </Text>
                    </View>
                    <Text style={styles.insightValue}>
                      ₹{Math.round(bank.spent).toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.bentoText}>
                  Start spending through linked accounts to unlock bank-wise usage.
                </Text>
              )}
            </BlurView>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/health-report");
            }}
            style={({ pressed }) => [
              styles.insightCardPressable,
              pressed && styles.cardPressed,
            ]}
          >
            <BlurView intensity={28} tint="dark" style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.bentoTitle}>HEALTH SCORE REPORT</Text>
                <View style={styles.insightHeaderActions}>
                  <Ionicons
                    name="pulse-outline"
                    size={18}
                    color={THEME.colors.success}
                  />
                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={THEME.colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.healthReportTop}>
                <Text style={styles.healthReportScore}>{healthScore}</Text>
                <View>
                  <Text style={styles.insightPrimary}>
                    {healthScoreReport.status} financial health
                  </Text>
                  <Text style={styles.insightSecondary}>
                    {healthScoreReport.scoreDrop > 0
                      ? `Down by ${healthScoreReport.scoreDrop} points`
                      : "No score drop from budget pressure"}
                  </Text>
                </View>
              </View>
              {healthScoreReport.reasons.slice(0, 2).map((reason) => (
                <View key={reason} style={styles.reasonRow}>
                  <Ionicons
                    name="remove-outline"
                    size={16}
                    color={THEME.colors.textSecondary}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </BlurView>
          </Pressable>
        </View>

        <Animated.View
          entering={FadeInUp.delay(150).springify()}
          style={styles.cardWrapper}
          className="w-full"
        >
          <Text style={styles.bentoTitle}>DISTRIBUTION METRICS</Text>
          <View style={styles.donutWrapper}>
            <PieChart
              data={chartData}
              donut
              showGradient
              sectionAutoFocus
              radius={100}
              innerRadius={75}
              innerCircleColor={THEME.colors.surface} // Map back to dark slate wrapper
              onPress={handlePiePress}
              centerLabelComponent={() => {
                return (
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        color: THEME.colors.textPrimary,
                        fontWeight: "900",
                      }}
                    >{`₹${(activeChartAmount / 1000).toFixed(1)}k`}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: THEME.colors.textSecondary,
                      }}
                    >
                      {activeChartLabel}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </Animated.View>

        <View style={styles.bentoGrid} className="flex-row flex-wrap w-full">
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.bentoTile, styles.bentoSquare, { minWidth: "45%" }]}
          >
            <Text style={styles.bentoTitle}>HEALTH SCORE</Text>
            <View style={styles.healthScoreWrap}>
              <Text style={styles.bentoValue}>{healthScore}</Text>
              <Text style={[styles.bentoText, { marginTop: 0 }]}>/ 100</Text>
            </View>
          </BlurView>

          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.bentoTile, styles.bentoSquare, { minWidth: "45%" }]}
          >
            <Text style={styles.bentoTitle}>AI ORACLE</Text>
            <Text style={styles.bentoText}>{aiInsight}</Text>
          </BlurView>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={showIncomeModal}
        onRequestClose={() => setShowIncomeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardWrap}
          >
            <View
              style={[
                styles.modalCard,
                {
                  paddingBottom: 24 + Math.max(insets.bottom, 6),
                },
              ]}
            >
              <Text style={styles.modalTitle}>Add Income</Text>
              <Text style={styles.modalSubtitle}>
                Record salary, transfer, refund, or any incoming cash flow.
              </Text>

              <TextInput
                value={incomeAmount}
                onChangeText={setIncomeAmount}
                placeholder="Amount"
                placeholderTextColor={THEME.colors.textSecondary}
                keyboardType="numeric"
                style={styles.modalInput}
              />
              <TextInput
                value={incomeSource}
                onChangeText={setIncomeSource}
                placeholder="Source e.g. Salary, Freelance"
                placeholderTextColor={THEME.colors.textSecondary}
                style={styles.modalInput}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowIncomeModal(false)}
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddIncome}
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                >
                  <Text style={styles.modalButtonText}>Save Income</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={showProfileModal}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardWrap}
          >
            <View
              style={[
                styles.profileSheet,
                {
                  marginTop: Math.max(insets.top, 16) + 12,
                  paddingBottom: 18 + Math.max(insets.bottom, 8),
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.profileSheetContent}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileBadge}>
                    <Ionicons
                      name="wallet-outline"
                      size={20}
                      color={THEME.colors.secondary}
                    />
                  </View>
                  <Text style={styles.modalTitle}>Budget Settings</Text>
                  <Text style={styles.modalSubtitle}>
                    Review locked account identity details and manage your spending cap and alert style.
                  </Text>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.sectionTitle}>Account</Text>
                  <Text style={styles.selectorCaption}>
                    Name and mobile number are fixed for this account and are synced from your backend profile.
                  </Text>
                  <View style={styles.lockedField}>
                    <Text style={styles.lockedFieldLabel}>Full name</Text>
                    <Text style={styles.lockedFieldValue}>
                      {profileName?.trim() || "Not available"}
                    </Text>
                  </View>
                  <View style={styles.lockedField}>
                    <Text style={styles.lockedFieldLabel}>Mobile number</Text>
                    <Text style={styles.lockedFieldValue}>
                      {profilePhone?.trim() || "Not available"}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.sectionTitle}>Monthly Budget</Text>
                  <Text style={styles.selectorCaption}>
                    Enter the amount you want to spend in one month. SpendWise will convert it into daily, quarterly, or yearly tracking automatically.
                  </Text>
                  <TextInput
                    value={monthlyTargetExpense}
                    onChangeText={setMonthlyTargetExpense}
                    placeholder="Monthly expense limit"
                    placeholderTextColor={THEME.colors.textSecondary}
                    keyboardType="numeric"
                    style={styles.modalInput}
                  />
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.sectionTitle}>Alert Mode</Text>
                  <Text style={styles.selectorCaption}>
                    Pick how often you want SpendWise to evaluate your spending against this monthly budget.
                  </Text>
                  <View style={styles.frequencyWrap}>
                    {ALERT_FREQUENCY_OPTIONS.map((option) => (
                      <Pressable
                        key={option.key}
                        onPress={() => setAlertFrequency(option.key)}
                        style={[
                          styles.frequencyPill,
                          alertFrequency === option.key && styles.frequencyPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.frequencyText,
                            alertFrequency === option.key && styles.frequencyTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.frequencySubtext,
                            alertFrequency === option.key && styles.frequencySubtextActive,
                          ]}
                        >
                          {option.description}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.budgetPreviewCard}>
                  <Text style={styles.previewTitle}>Budget Overview</Text>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Entered monthly limit</Text>
                    <Text style={styles.previewValue}>
                      ₹{(Number(monthlyTargetExpense) || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Tracking mode</Text>
                    <Text style={styles.previewValue}>
                      {profilePreviewSnapshot.periodLabel.charAt(0).toUpperCase() +
                        profilePreviewSnapshot.periodLabel.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Limit for this period</Text>
                    <Text style={styles.previewValue}>
                      ₹{profilePreviewSnapshot.periodTarget.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Spent so far</Text>
                    <Text style={styles.previewValue}>
                      ₹{profilePreviewSnapshot.spent.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.previewProgressTrack}>
                    <View
                      style={[
                        styles.previewProgressFill,
                        {
                          width: `${Math.min(profilePreviewSnapshot.percentUsed, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.previewFootnote}>
                    {profilePreviewSnapshot.percentUsed.toFixed(0)}% used in the active period.
                  </Text>
                  <View style={styles.previewThresholdRow}>
                    <View style={styles.thresholdChip}>
                      <Text style={styles.thresholdChipLabel}>Heads-up point</Text>
                      <Text style={styles.thresholdChipValue}>
                        ₹{profilePreviewSnapshot.fiftyPercentAmount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.thresholdChip}>
                      <Text style={styles.thresholdChipLabel}>Critical point</Text>
                      <Text style={styles.thresholdChipValue}>
                        ₹{profilePreviewSnapshot.ninetyPercentAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.savedSummaryCard}>
                  <View style={styles.profileMetaRow}>
                    <Text style={styles.profileMetaLabel}>Current saved mode</Text>
                    <Text style={styles.profileMetaValue}>
                      {alertBudgetSnapshot.periodLabel.charAt(0).toUpperCase() +
                        alertBudgetSnapshot.periodLabel.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.profileMetaRow}>
                    <Text style={styles.profileMetaLabel}>Current saved active limit</Text>
                    <Text style={styles.profileMetaValue}>
                      ₹{alertBudgetSnapshot.periodTarget.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setShowProfileModal(false)}
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveProfile}
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                  >
                    <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                      Save Changes
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={handleLogout}
                  style={[styles.logoutButton, styles.modalButtonSecondary]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={THEME.colors.textPrimary}
                  />
                  <Text style={styles.modalButtonText}>Log Out</Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: THEME.layout.spacing,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  dateLabel: {
    fontFamily: 'Sora_800ExtraBold',
    letterSpacing: 3,
    textTransform: "uppercase",
    fontSize: 16,
    color: THEME.colors.textPrimary,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: THEME.colors.surfaceGlass,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    width: "100%",
    overflow: "visible",
  },
  biometricRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.4)",
    backgroundColor: THEME.colors.surfaceGlass,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 11,
    color: THEME.colors.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroBalance: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 36,
    color: THEME.colors.textPrimary,
    textAlign: "center",
    marginTop: 4,
  },
  quickActionHub: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 30,
    gap: 12,
  },
  actionBtn: {
    minWidth: 150,
    borderWidth: 1,
    borderRadius: THEME.layout.borderRadius,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderColor: THEME.colors.borderGlass,
    gap: 8,
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    color: THEME.colors.textPrimary,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  insightGrid: {
    gap: 16,
    marginBottom: 22,
  },
  insightCardPressable: {
    borderRadius: THEME.layout.borderRadius,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  insightCard: {
    borderRadius: THEME.layout.borderRadius,
    padding: 18,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    overflow: "hidden",
    gap: 12,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  insightHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  insightPrimary: {
    fontFamily: 'Inter_600SemiBold',
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  insightSecondary: {
    fontFamily: 'Inter_400Regular',
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  insightValue: {
    fontFamily: 'Sora_700Bold',
    color: THEME.colors.secondary,
    fontSize: 15,
  },
  healthReportTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  healthReportScore: {
    fontFamily: 'Sora_800ExtraBold',
    color: THEME.colors.textPrimary,
    fontSize: 34,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  reasonText: {
    fontFamily: 'Inter_400Regular',
    color: THEME.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  cardWrapper: {
    borderRadius: THEME.layout.borderRadius,
    padding: 24,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    overflow: "hidden",
    marginBottom: 20,
  },
  donutWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    height: 220,
  },
  healthScoreWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 8,
  },
  bentoGrid: {
    gap: 16,
  },
  bentoSquare: {
    flex: 1,
    height: 140,
  },
  bentoTile: {
    borderRadius: THEME.layout.borderRadius,
    padding: 20,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    overflow: "hidden",
  },
  bentoTitle: {
    fontFamily: 'SpaceGrotesk_500Medium',
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  bentoValue: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 36,
    color: THEME.colors.textPrimary,
  },
  bentoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 8, 23, 0.7)",
    justifyContent: "flex-end",
  },
  modalKeyboardWrap: {
    width: "100%",
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    gap: 14,
  },
  profileSheet: {
    backgroundColor: "#0A1220",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    overflow: "hidden",
  },
  profileSheetContent: {
    padding: 24,
    gap: 18,
  },
  profileHeader: {
    gap: 10,
  },
  profileBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34, 211, 238, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.3)",
  },
  profileSection: {
    gap: 10,
  },
  sectionTitle: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  modalTitle: {
    ...THEME.typography.heroText,
    fontSize: 24,
    color: THEME.colors.textPrimary,
  },
  modalSubtitle: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
  selectorCaption: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.surfaceGlass,
  },
  lockedField: {
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 6,
  },
  lockedFieldLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  lockedFieldValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimary: {
    backgroundColor: THEME.colors.secondary,
  },
  modalButtonSecondary: {
    backgroundColor: THEME.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
  },
  modalButtonText: {
    ...THEME.typography.boldHeader,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  modalButtonTextPrimary: {
    color: "#03131A",
  },
  frequencyWrap: {
    gap: 10,
  },
  budgetPreviewCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: "rgba(10, 18, 36, 0.8)",
    padding: 16,
    gap: 12,
  },
  previewTitle: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
  },
  previewValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  previewThresholdRow: {
    flexDirection: "row",
    gap: 10,
  },
  previewProgressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  previewProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: THEME.colors.secondary,
  },
  previewFootnote: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  thresholdChip: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    padding: 12,
  },
  frequencyPill: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: THEME.colors.surfaceGlass,
    gap: 4,
  },
  frequencyPillActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  frequencyText: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  frequencyTextActive: {
    color: THEME.colors.textPrimary,
  },
  frequencySubtext: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    fontSize: 12,
  },
  frequencySubtextActive: {
    color: "rgba(255,255,255,0.88)",
  },
  thresholdChipLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  thresholdChipValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    marginTop: 4,
  },
  profileMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  profileMetaLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
  },
  profileMetaValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  savedSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: THEME.colors.surfaceGlass,
    padding: 16,
    gap: 10,
  },
  logoutButton: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
  },
});
