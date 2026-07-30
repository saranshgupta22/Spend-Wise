import { THEME } from "@/constants/theme";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useAppStore } from "@/src/store/useAppStore";
import { buildBankwiseStats } from "@/src/utils/homeInsights";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const formatCurrency = (amount) =>
  `₹${Math.round(Number(amount) || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "No recent activity";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent activity";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function BankwiseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const transactions = useAppStore((state) => state.transactions);

  useTransactions();

  const bankStats = useMemo(() => buildBankwiseStats(transactions), [transactions]);
  const expenseTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === "expense"),
    [transactions],
  );
  const totalSpent = useMemo(
    () => expenseTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
    [expenseTransactions],
  );
  const leadBank = bankStats[0] || null;
  const concentration = leadBank ? Math.round(leadBank.shareOfSpend) : 0;

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
            <Text style={styles.eyebrow}>Spend Distribution</Text>
            <Text style={styles.title}>Bankwise Spend Report</Text>
          </View>
        </View>

        <BlurView intensity={28} tint="dark" style={styles.heroCard}>
          <Text style={styles.heroLabel}>Tracked expense flow</Text>
          <Text style={styles.heroAmount}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.heroText}>
            {leadBank
              ? `${leadBank.bank} leads with ${concentration}% of your expense load.`
              : "Add expense activity to unlock bank-level routing and concentration analysis."}
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Banks active</Text>
              <Text style={styles.heroStatValue}>{bankStats.length}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Top account</Text>
              <Text style={styles.heroStatValue}>{leadBank?.bank || "None"}</Text>
            </View>
          </View>
        </BlurView>

        {bankStats.length > 0 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Linked Spend Lanes</Text>
              {bankStats.map((bank) => (
                <BlurView key={bank.bank} intensity={22} tint="dark" style={styles.bankCard}>
                  <View style={styles.bankCardTop}>
                    <View style={styles.bankTitleWrap}>
                      <Text style={styles.bankRank}>#{bank.rank}</Text>
                      <View>
                        <Text style={styles.bankName}>{bank.bank}</Text>
                        <Text style={styles.bankMeta}>
                          {bank.count} transaction{bank.count > 1 ? "s" : ""} • Last used {formatDate(bank.lastTransactionDate)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.bankAmount}>{formatCurrency(bank.spent)}</Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(bank.shareOfSpend, 100)}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.bankMetricsRow}>
                    <View style={styles.bankMetric}>
                      <Text style={styles.bankMetricLabel}>Share of spend</Text>
                      <Text style={styles.bankMetricValue}>
                        {Math.round(bank.shareOfSpend)}%
                      </Text>
                    </View>
                    <View style={styles.bankMetric}>
                      <Text style={styles.bankMetricLabel}>Avg transaction</Text>
                      <Text style={styles.bankMetricValue}>
                        {formatCurrency(bank.averageSpend)}
                      </Text>
                    </View>
                  </View>
                </BlurView>
              ))}
            </View>

            <BlurView intensity={24} tint="dark" style={styles.notesCard}>
              <Text style={styles.sectionTitle}>Assessment</Text>
              <Text style={styles.noteLine}>
                {concentration >= 60
                  ? "Spending is heavily concentrated in one account. That makes limit management and fraud review easier, but it also concentrates risk."
                  : "Spending is reasonably distributed across accounts, which reduces over-dependence on one bank rail."}
              </Text>
              <Text style={styles.noteLine}>
                {leadBank
                  ? `Your lead account is averaging ${formatCurrency(leadBank.averageSpend)} per transaction.`
                  : "No lead account has emerged yet."}
              </Text>
            </BlurView>
          </>
        ) : (
          <BlurView intensity={24} tint="dark" style={styles.emptyCard}>
            <Ionicons name="card-outline" size={30} color={THEME.colors.secondary} />
            <Text style={styles.emptyTitle}>No bankwise data yet</Text>
            <Text style={styles.emptyText}>
              Expense entries need merchant or SMS-linked banking clues before this report can rank accounts.
            </Text>
          </BlurView>
        )}
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
    gap: 10,
    overflow: "hidden",
  },
  heroLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
  },
  heroAmount: {
    ...THEME.typography.heroText,
    color: THEME.colors.textPrimary,
    fontSize: 36,
  },
  heroText: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  heroStat: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: THEME.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroStatLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  heroStatValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    marginTop: 6,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 16,
  },
  bankCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: "rgba(12, 18, 30, 0.88)",
    gap: 14,
    overflow: "hidden",
  },
  bankCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  bankTitleWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  bankRank: {
    ...THEME.typography.heroText,
    color: THEME.colors.secondary,
    fontSize: 18,
    marginTop: 1,
  },
  bankName: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 16,
  },
  bankMeta: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  bankAmount: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 18,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.colors.secondary,
    borderRadius: 999,
  },
  bankMetricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  bankMetric: {
    flex: 1,
  },
  bankMetricLabel: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  bankMetricValue: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    marginTop: 5,
  },
  notesCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: "rgba(8, 14, 27, 0.88)",
    gap: 10,
    overflow: "hidden",
  },
  noteLine: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    backgroundColor: "rgba(10, 18, 30, 0.9)",
    overflow: "hidden",
  },
  emptyTitle: {
    ...THEME.typography.boldHeader,
    color: THEME.colors.textPrimary,
    fontSize: 18,
  },
  emptyText: {
    ...THEME.typography.labelLight,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
});
