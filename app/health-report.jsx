import { THEME } from "@/constants/theme";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useAppStore } from "@/src/store/useAppStore";
import {
  applyBudgetHealthPenalty,
  buildBudgetSnapshot,
} from "@/src/utils/budgetAlerts";
import { computeAnalytics } from "@/src/utils/analyticsEngine";
import { buildHealthScoreReport } from "@/src/utils/homeInsights";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const scoreTone = (score) => {
  if (score >= 80) return THEME.colors.success;
  if (score >= 60) return THEME.colors.secondary;
  if (score >= 40) return "#F59E0B";
  return THEME.colors.danger;
};

export default function HealthReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const transactions = useAppStore((state) => state.transactions);
  const user = useAppStore((state) => state.user);

  useTransactions();

  const analytics = useMemo(
    () => computeAnalytics(transactions, "1M"),
    [transactions],
  );
  const budgetSnapshot = useMemo(
    () =>
      buildBudgetSnapshot({
        transactions,
        monthlyTargetExpense: user?.monthly_target_expense,
        alertFrequency: user?.alert_frequency,
      }),
    [transactions, user?.alert_frequency, user?.monthly_target_expense],
  );
  const adjustedScore = useMemo(
    () => applyBudgetHealthPenalty(analytics.efficiencyScore, budgetSnapshot),
    [analytics.efficiencyScore, budgetSnapshot],
  );
  const report = useMemo(
    () =>
      buildHealthScoreReport({
        baseScore: analytics.efficiencyScore,
        adjustedScore,
        analytics,
        budgetSnapshot,
      }),
    [adjustedScore, analytics, budgetSnapshot],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 18,
            paddingBottom: Math.max(insets.bottom, 24) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={THEME.colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Health Diagnostics</Text>
            <Text style={styles.title}>Health Score Report</Text>
          </View>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Current score</Text>
              <Text style={[styles.heroScore, { color: scoreTone(report.score) }]}>
                {report.score}
              </Text>
            </View>
            <View style={[styles.statusChip, { borderColor: scoreTone(report.score) }]}>
              <Text style={[styles.statusChipText, { color: scoreTone(report.score) }]}>
                {report.status}
              </Text>
            </View>
          </View>
          <Text style={styles.heroText}>
            {report.scoreDrop > 0
              ? `Budget pressure reduced your score by ${report.scoreDrop} point${report.scoreDrop > 1 ? "s" : ""} this cycle.`
              : "No budget penalty is being applied right now."}
          </Text>
          <View style={styles.metricsGrid}>
            {report.metrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </BlurView>

        <BlurView intensity={24} tint="dark" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Budget Window</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tracking mode</Text>
            <Text style={styles.summaryValue}>
              {(budgetSnapshot.periodLabel || "monthly").charAt(0).toUpperCase() +
                (budgetSnapshot.periodLabel || "monthly").slice(1)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Target</Text>
            <Text style={styles.summaryValue}>₹{Math.round(budgetSnapshot.periodTarget || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryValue}>₹{Math.round(budgetSnapshot.spent || 0).toLocaleString()}</Text>
          </View>
        </BlurView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why the score moved</Text>
          {report.reasons.map((item) => (
            <BlurView key={item} intensity={18} tint="dark" style={styles.listCard}>
              <Ionicons name="pulse-outline" size={18} color={THEME.colors.secondary} />
              <Text style={styles.listText}>{item}</Text>
            </BlurView>
          ))}
        </View>

        {report.strengths.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is working</Text>
            {report.strengths.map((item) => (
              <BlurView key={item} intensity={18} tint="dark" style={styles.listCard}>
                <Ionicons name="checkmark-circle-outline" size={18} color={THEME.colors.success} />
                <Text style={styles.listText}>{item}</Text>
              </BlurView>
            ))}
          </View>
        ) : null}

        {report.alerts.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Watchlist</Text>
            {report.alerts.map((item) => (
              <BlurView key={item} intensity={18} tint="dark" style={styles.listCard}>
                <Ionicons name="alert-circle-outline" size={18} color={THEME.colors.danger} />
                <Text style={styles.listText}>{item}</Text>
              </BlurView>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended next steps</Text>
          {report.recommendations.map((item) => (
            <BlurView key={item} intensity={18} tint="dark" style={styles.listCard}>
              <Ionicons name="trending-up-outline" size={18} color={THEME.colors.secondary} />
              <Text style={styles.listText}>{item}</Text>
            </BlurView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 20,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: THEME.colors.surfaceGlass,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...THEME.typography.labelLight,
    color: THEME.colors.secondary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    ...THEME.typography.heroText,
    color: THEME.colors.textPrimary,
    fontSize: 28,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: "rgba(12, 19, 34, 0.9)",
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    gap: 14,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
  },
  heroScore: {
    ...THEME.typography.heroText,
    fontSize: 48,
    marginTop: 4,
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  statusChipText: {
    ...THEME.typography.boldHeader,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  heroText: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "47%",
    borderRadius: 16,
    padding: 14,
    backgroundColor: THEME.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  metricLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
  },
  metricValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 16,
    marginTop: 7,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: "rgba(8, 14, 27, 0.88)",
    gap: 10,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 16,
  },
  listCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: "rgba(10, 18, 30, 0.88)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    overflow: "hidden",
  },
  listText: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 21,
    fontSize: 14,
    flex: 1,
  },
});
