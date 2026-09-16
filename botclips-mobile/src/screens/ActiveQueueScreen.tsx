import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { BotClipsApi } from '../services/api';
import { EngagementOrder } from '../types';
import { COLORS } from '../constants/theme';

interface ActiveQueueScreenProps {
  onInspectOrder: (orderId: string) => void;
}

export const ActiveQueueScreen: React.FC<ActiveQueueScreenProps> = ({ onInspectOrder }) => {
  const [orders, setOrders] = useState<EngagementOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(154); // 2m 34s

  const loadOrders = async () => {
    const data = await BotClipsApi.getActiveOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await BotClipsApi.triggerPulse();
    await loadOrders();
    setRefreshing(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="JITTER QUEUE & SCHEDULE" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />
        }
      >
        {/* Next Batch Header Card */}
        <GlassCard highlight style={styles.countdownCard}>
          <View style={styles.countdownRow}>
            <View>
              <Text style={styles.countdownLabel}>NEXT MICRO-BATCH DISPATCH</Text>
              <Text style={styles.countdownTimer}>{formatTime(countdown)}</Text>
            </View>
            <View style={styles.countdownIconBox}>
              <Clock size={28} color={COLORS.cyan} />
            </View>
          </View>
          <View style={styles.countdownFooter}>
            <Zap size={13} color={COLORS.neonGreen} />
            <Text style={styles.countdownFooterText}>
              Pacing: Poisson Randomized Interval (2m 12s - 2m 48s)
            </Text>
          </View>
        </GlassCard>

        {/* Active Campaigns List */}
        <Text style={styles.sectionHeading}>ACTIVE DISPATCH QUEUE ({orders.length})</Text>
        {orders.length === 0 ? (
          <View style={styles.emptyQueueCard}>
            <Clock size={28} color={COLORS.cyan} />
            <Text style={styles.emptyQueueTitle}>No active campaigns in queue</Text>
            <Text style={styles.emptyQueueSub}>Orders scheduled with 4-Signal Jitter will appear here live.</Text>
          </View>
        ) : (
          orders.map((order) => {
            const progressPercent = order.totalQuantity > 0
              ? Math.min(100, Math.round((order.deliveredQuantity / order.totalQuantity) * 100))
              : 0;

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => onInspectOrder(order.id)}
                activeOpacity={0.8}
              >
                <View style={styles.orderTopRow}>
                  <View style={styles.orderTitleGroup}>
                    <Text style={styles.orderIdText}>{order.id}</Text>
                    <Text style={styles.orderName} numberOfLines={1}>{order.serviceName}</Text>
                  </View>
                  <View style={styles.badgeProgress}>
                    <Text style={styles.badgeProgressText}>{progressPercent}% Paced</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>

                <View style={styles.metricsRow}>
                  <Text style={styles.metricLabel}>
                    Delivered: <Text style={styles.metricVal}>{order.deliveredQuantity.toLocaleString()} / {order.totalQuantity.toLocaleString()}</Text>
                  </Text>
                  <Text style={styles.metricInterval}>Jitter: ±18.4%</Text>
                </View>

                <View style={styles.orderBottomBar}>
                  <View style={styles.signalTags}>
                    <Text style={styles.signalTag}>❤️ {order.accumulatedLikes} Likes</Text>
                    <Text style={styles.signalTag}>🔖 {order.accumulatedSaves} Saves</Text>
                    <Text style={styles.signalTag}>🔄 {order.accumulatedShares} Shares</Text>
                  </View>
                  <ChevronRight size={16} color={COLORS.cyan} />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Milestone Flush Accumulator Card */}
        <Text style={styles.sectionHeading}>MILESTONE ACCUMULATOR STATUS</Text>
        <GlassCard style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <Layers size={18} color={COLORS.purple} />
            <Text style={styles.milestoneTitle}>Multi-Signal Milestone Flush</Text>
          </View>

          <Text style={styles.milestoneDesc}>
            Sub-orders (Likes/Saves/Shares) accumulate in micro-fractions and automatically flush to the upstream network once minimum threshold (≥ 10) is achieved.
          </Text>

          <View style={styles.milestoneStatsRow}>
            <View style={styles.milestoneStatBox}>
              <Text style={styles.statVal}>8,450</Text>
              <Text style={styles.statLabel}>Signals Flushed</Text>
            </View>
            <View style={styles.milestoneStatBox}>
              <Text style={styles.statVal}>0/100</Text>
              <Text style={styles.statLabel}>Bot Index (Audit Pass)</Text>
            </View>
            <View style={styles.milestoneStatBox}>
              <Text style={styles.statVal}>12 Batches</Text>
              <Text style={styles.statLabel}>To Next Flush</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40
  },
  countdownCard: {
    marginTop: 10,
    marginBottom: 16
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1
  },
  countdownTimer: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2
  },
  countdownIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  countdownFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.15)',
    paddingTop: 8,
    gap: 6
  },
  countdownFooterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: 10
  },
  emptyQueueCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyQueueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10
  },
  emptyQueueSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4
  },
  orderCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  orderTitleGroup: {
    flex: 1
  },
  orderIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan
  },
  orderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2
  },
  badgeProgress: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeProgressText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.cyan,
    borderRadius: 3
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  metricVal: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  metricInterval: {
    fontSize: 11,
    color: COLORS.neonGreen,
    fontWeight: '600'
  },
  orderBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.1)',
    paddingTop: 8
  },
  signalTags: {
    flexDirection: 'row',
    gap: 8
  },
  signalTag: {
    fontSize: 10,
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  milestoneCard: {
    marginBottom: 20
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  milestoneDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 12
  },
  milestoneStatsRow: {
    flexDirection: 'row',
    gap: 8
  },
  milestoneStatBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center'
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.cyan
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2
  }
});
