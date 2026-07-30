import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { PieChart } from 'react-native-gifted-charts';
import { useAppStore } from '@/src/store/useAppStore';
import { computeAnalytics } from '@/src/utils/analyticsEngine';
import { useTransactions } from '@/src/hooks/useTransactions';

const { width } = Dimensions.get('window');

const FILTERS = ['1W', '1M', '1Y'];

function StatCard({ icon, label, value, subValue, color, delay = 0 }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      layout={Layout.springify()}
      style={styles.statCard}
    >
      <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subValue ? <Text style={styles.statSub}>{subValue}</Text> : null}
    </Animated.View>
  );
}

export default function AnalyticsScreen() {
  const transactions = useAppStore((state) => state.transactions);
  useTransactions();

  const [filter, setFilter] = useState('1M');

  const analytics = useMemo(
    () => computeAnalytics(transactions, filter),
    [transactions, filter],
  );

  const handleFilter = (f) => {
    Haptics.selectionAsync();
    setFilter(f);
  };

  const pieData = analytics.categoryBreakdown.map((cat) => ({
    value: cat.amount,
    color: cat.color,
    text: cat.name,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>PORTFOLIO</Text>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        {/* Filter pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => handleFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Pie chart card */}
        <Animated.View
          entering={FadeInDown.delay(60).springify()}
          layout={Layout.springify()}
          style={styles.pieCard}
        >
          <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={styles.cardTitle}>Category Breakdown</Text>
          {pieData.length > 0 ? (
            <View style={styles.pieWrap}>
              <PieChart
                data={pieData}
                donut
                innerRadius={72}
                radius={108}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.pieCenter}>₹{Math.round(analytics.totalSpent).toLocaleString()}</Text>
                    <Text style={styles.pieCenterSub}>Spent</Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="pie-chart-outline" size={40} color="#334155" />
              <Text style={styles.emptyText}>No data for this period</Text>
            </View>
          )}

          {/* Legend */}
          {pieData.length > 0 && (
            <View style={styles.legend}>
              {pieData.slice(0, 5).map((item) => (
                <View key={item.text} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.text}</Text>
                  <Text style={styles.legendValue}>₹{Math.round(item.value).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* 2x2 stat grid */}
        <View style={styles.statGrid}>
          <StatCard
            icon="flash"
            label="Money Efficiency"
            value={`${analytics.efficiencyScore}/100`}
            color="#10B981"
            delay={100}
          />
          <StatCard
            icon="swap-vertical"
            label="Cash In / Out"
            value={`₹${Math.round(analytics.totalIncome).toLocaleString()}`}
            subValue={`Out: ₹${Math.round(analytics.totalSpent).toLocaleString()}`}
            color="#22D3EE"
            delay={140}
          />
          <StatCard
            icon="gift"
            label="Total Cashback"
            value={`₹${Math.round(analytics.totalCashback).toLocaleString()}`}
            color="#A855F7"
            delay={180}
          />
          <StatCard
            icon="time"
            label="Peak Spend"
            value={analytics.peakExpenseTimeOfDay}
            subValue={`${analytics.peakExpenseHour}:00 onwards`}
            color="#FB7185"
            delay={220}
          />
        </View>

        {/* Subscriptions */}
        <Animated.View
          entering={FadeInDown.delay(260).springify()}
          style={styles.subCard}
        >
          <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.subCardHeader}>
            <View>
              <Text style={styles.cardTitle}>Active Subscriptions</Text>
              <Text style={styles.cardSubtitle}>Recurring commitments detected</Text>
            </View>
            <View style={styles.subBadge}>
              <Text style={styles.subBadgeText}>{analytics.subscriptions.length}</Text>
            </View>
          </View>

          {analytics.subscriptions.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="refresh-circle-outline" size={36} color="#334155" />
              <Text style={styles.emptyText}>No active subscriptions found</Text>
            </View>
          ) : (
            analytics.subscriptions.map((sub, i) => (
              <View key={i} style={styles.subRow}>
                <View style={styles.subRowLeft}>
                  <View style={styles.subDot} />
                  <Text style={styles.subTitle}>{sub.title}</Text>
                </View>
                <Text style={styles.subAmount}>₹{sub.amount}</Text>
              </View>
            ))
          )}
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03040D' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTag: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    letterSpacing: 3,
    color: '#475569',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 30,
    color: '#F1F5F9',
    letterSpacing: -0.5,
  },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(99,102,241,0.18)',
    borderColor: 'rgba(99,102,241,0.4)',
  },
  filterText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  filterTextActive: { color: '#818CF8' },
  scroll: { paddingHorizontal: 20 },
  pieCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(12,14,31,0.8)',
    padding: 20,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#F1F5F9',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
  },
  pieWrap: { alignItems: 'center', paddingVertical: 20 },
  pieCenter: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 20,
    color: '#F1F5F9',
  },
  pieCenterSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#334155',
  },
  legend: { gap: 10, marginTop: 4 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#94A3B8',
  },
  legendValue: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 13,
    color: '#F1F5F9',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(12,14,31,0.8)',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
  },
  statSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#475569',
  },
  subCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(12,14,31,0.8)',
    padding: 20,
    marginBottom: 14,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBadgeText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 13,
    color: '#818CF8',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  subRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  subTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  subAmount: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    color: '#22D3EE',
  },
});
