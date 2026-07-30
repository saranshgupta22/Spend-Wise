import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppStore } from '@/src/store/useAppStore';

const fmt = (amount) => `₹${Math.round(amount || 0).toLocaleString()}`;

function MetricCard({ label, value, color, icon, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.metricCard}>
      <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.metricIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </Animated.View>
  );
}

function InsightCard({ title, body, accent, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.insightCard}>
      <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.insightHeader}>
        <View style={styles.insightTitleRow}>
          <View style={[styles.insightDot, { backgroundColor: accent }]} />
          <Text style={[styles.insightTitle, { color: accent }]}>{title}</Text>
        </View>
      </View>
      <Text style={styles.insightBody}>{body}</Text>
    </Animated.View>
  );
}

export default function AIBrainScreen() {
  const router = useRouter();
  const transactions = useAppStore((state) => state.transactions);

  const analytics = useMemo(() => {
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 30);
    const recent = transactions.filter((tx) => tx.date && new Date(tx.date) >= threshold);
    const expenseTx = recent.filter((tx) => tx.type === 'expense');
    const incomeTx = recent.filter((tx) => tx.type === 'income');
    const totalExpense = expenseTx.reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    const totalIncome = incomeTx.reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    const recurringTx = recent.filter((tx) => tx.isSubscription || tx.is_recurring || tx.isRecurring);
    const recurringAmount = recurringTx.reduce((s, tx) => s + (Number(tx.amount) || 0), 0);
    const categoryTotals = expenseTx.reduce((acc, tx) => {
      const c = tx.category || 'Other';
      acc[c] = (acc[c] || 0) + (Number(tx.amount) || 0);
      return acc;
    }, {});
    const topCategory = Object.keys(categoryTotals).reduce((best, c) =>
      !best || categoryTotals[c] > categoryTotals[best] ? c : best, null);
    const topCategoryAmount = categoryTotals[topCategory] || 0;
    const topCategoryList = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));
    const netFlow = totalIncome - totalExpense;
    return {
      totalExpense, totalIncome, recurringAmount,
      recurringCount: recurringTx.length,
      topCategory: topCategory || 'Other',
      topCategoryAmount,
      topCategoryList,
      netFlow,
      averageDailyExpense: Math.round(totalExpense / 30),
    };
  }, [transactions]);

  const isPositive = analytics.netFlow >= 0;
  const insightText = isPositive
    ? 'Your cash flow is positive. Keep the momentum by reviewing subscriptions and categories.'
    : 'Your spend is ahead of income. Review the top category to regain control this month.';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={styles.headerTag}>AI BRAIN</Text>
          <Text style={styles.headerTitle}>Smart Insights</Text>
        </Animated.View>

        {/* Metric row */}
        <View style={styles.metricRow}>
          <MetricCard
            label="Net Flow"
            value={fmt(analytics.netFlow)}
            color={isPositive ? '#10B981' : '#FB7185'}
            icon={isPositive ? 'trending-up' : 'trending-down'}
            delay={60}
          />
          <MetricCard
            label="Daily Spend"
            value={fmt(analytics.averageDailyExpense)}
            color="#22D3EE"
            icon="calendar-outline"
            delay={100}
          />
          <MetricCard
            label="Recurring"
            value={fmt(analytics.recurringAmount)}
            color="#A855F7"
            icon="repeat-outline"
            delay={140}
          />
        </View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.actionRow}>
          {[
            { label: 'Scan Receipt', icon: 'scan-outline', route: '/scanner', color: '#22D3EE' },
            { label: 'Open Ledger', icon: 'list-outline', route: '/ledger', color: '#6366F1' },
          ].map(({ label, icon, route, color }) => (
            <Pressable
              key={label}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.75 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(route);
              }}
            >
              <LinearGradient
                colors={[`${color}22`, `${color}0A`]}
                style={styles.actionBtnGradient}
              >
                <Ionicons name={icon} size={18} color={color} />
                <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </Animated.View>

        {/* Main insight */}
        <InsightCard
          title="AI Recommendation"
          body={insightText}
          accent="#6366F1"
          delay={200}
        />

        {/* Cash flow */}
        <InsightCard
          title="Cash Flow Overview"
          body={`In the last 30 days, you recorded `}
          accent="#22D3EE"
          delay={240}
        />

        {/* Override body with rich text for cash flow */}
        <Animated.View entering={FadeInDown.delay(240).springify()} style={[styles.insightCard, { marginTop: -16 }]}>
          <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.insightHeader}>
            <View style={styles.insightTitleRow}>
              <View style={[styles.insightDot, { backgroundColor: '#22D3EE' }]} />
              <Text style={[styles.insightTitle, { color: '#22D3EE' }]}>Cash Flow — 30 Days</Text>
            </View>
          </View>
          <View style={styles.cashFlowRow}>
            <View style={styles.cashFlowItem}>
              <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
              <Text style={styles.cashFlowLabel}>Income</Text>
              <Text style={[styles.cashFlowValue, { color: '#10B981' }]}>{fmt(analytics.totalIncome)}</Text>
            </View>
            <View style={styles.cashFlowDivider} />
            <View style={styles.cashFlowItem}>
              <Ionicons name="arrow-up-circle" size={20} color="#FB7185" />
              <Text style={styles.cashFlowLabel}>Expense</Text>
              <Text style={[styles.cashFlowValue, { color: '#FB7185' }]}>{fmt(analytics.totalExpense)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recurring */}
        <InsightCard
          title="Recurring Commitments"
          body={`You have ${analytics.recurringCount} recurring items totaling ${fmt(analytics.recurringAmount)} in the last 30 days. Review committed spend before the next cycle.`}
          accent="#A855F7"
          delay={280}
        />

        {/* Top category */}
        <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.insightCard}>
          <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.insightHeader}>
            <View style={styles.insightTitleRow}>
              <View style={[styles.insightDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.insightTitle, { color: '#F59E0B' }]}>Spending Focus</Text>
            </View>
          </View>
          <Text style={styles.insightBody}>
            Your primary category is{' '}
            <Text style={{ color: '#FB7185', fontFamily: 'Sora_700Bold' }}>
              {analytics.topCategory}
            </Text>{' '}
            with{' '}
            <Text style={{ color: '#FB7185', fontFamily: 'Sora_700Bold' }}>
              {fmt(analytics.topCategoryAmount)}
            </Text>{' '}
            spent. Focus here to tighten your budget.
          </Text>
          {analytics.topCategoryList.map(({ category, amount }) => (
            <View key={category} style={styles.catRow}>
              <Text style={styles.catName}>{category}</Text>
              <Text style={styles.catAmount}>{fmt(amount)}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03040D' },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  header: { marginBottom: 28 },
  headerTag: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    letterSpacing: 3,
    color: '#475569',
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 30,
    color: '#F1F5F9',
    letterSpacing: -0.5,
  },
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(12,14,31,0.8)',
    gap: 6,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 9,
    letterSpacing: 1,
    color: '#475569',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: 'Sora_700Bold',
    fontSize: 15,
    color: '#F1F5F9',
  },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  insightCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(12,14,31,0.8)',
    padding: 20,
    marginBottom: 14,
  },
  insightHeader: { marginBottom: 12 },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightDot: { width: 6, height: 6, borderRadius: 3 },
  insightTitle: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  insightBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 24,
  },
  cashFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cashFlowItem: { flex: 1, alignItems: 'center', gap: 6 },
  cashFlowDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  cashFlowLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
  },
  cashFlowValue: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  catName: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#94A3B8' },
  catAmount: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#F1F5F9' },
});
