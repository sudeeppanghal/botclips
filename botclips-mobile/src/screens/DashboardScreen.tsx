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
  PlusCircle,
  TrendingUp,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Wallet,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { BotClipsApi } from '../services/api';
import { UserWallet, EngagementOrder } from '../types';
import { COLORS } from '../constants/theme';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const currentUser = BotClipsApi.getCurrentUser();
  const [wallet, setWallet] = useState<UserWallet>({
    balanceINR: currentUser?.balance ?? 0,
    currency: 'INR',
    pendingDeposits: 0,
    totalSpent: 0
  });
  const [activeOrders, setActiveOrders] = useState<EngagementOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [walletData, ordersData] = await Promise.all([
      BotClipsApi.getWallet(),
      BotClipsApi.getActiveOrders()
    ]);
    setWallet(walletData);
    setActiveOrders(ordersData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await BotClipsApi.triggerPulse();
    setRefreshing(false);
  };

  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Clipper';

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />
        }
      >
        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Good Morning, {userName}</Text>
          <View style={styles.userBadge}>
            <Sparkles size={12} color={COLORS.cyan} />
            <Text style={styles.userBadgeText}>
              {currentUser?.role === 'ADMIN' ? 'Admin Access' : 'Verified Clipper'}
            </Text>
          </View>
        </View>

        {/* Live Wallet Balance Card */}
        <GlassCard highlight style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletLabelGroup}>
              <Wallet size={16} color={COLORS.cyan} />
              <Text style={styles.walletLabel}>WALLET BALANCE</Text>
            </View>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyBadgeText}>INR (₹)</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>
              ₹{wallet.balanceINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <TouchableOpacity
              style={styles.addFundsBtn}
              onPress={() => onNavigate('AddFunds')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1769FF', '#00F2FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addFundsGradient}
              >
                <PlusCircle size={15} color="#FFFFFF" />
                <Text style={styles.addFundsText}>Add Funds</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.walletFooter}>
            <Text style={styles.walletFooterText}>Auto-Jitter Active • Instant UPI & USDT</Text>
          </View>
        </GlassCard>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionHeading}>QUICK ACTIONS</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => onNavigate('NewOrder')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(0, 242, 254, 0.15)' }]}>
                <Zap size={22} color={COLORS.cyan} />
              </View>
              <Text style={styles.actionTitle}>New Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => onNavigate('AddFunds')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(23, 105, 255, 0.15)' }]}>
                <Wallet size={22} color={COLORS.blue} />
              </View>
              <Text style={styles.actionTitle}>Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => onNavigate('ActiveQueue')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(107, 60, 255, 0.15)' }]}>
                <Clock size={22} color={COLORS.purple} />
              </View>
              <Text style={styles.actionTitle}>Active Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTile}
              onPress={() => onNavigate('Profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <TrendingUp size={22} color={COLORS.neonGreen} />
              </View>
              <Text style={styles.actionTitle}>Whop Payout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Organic Curve Engine Velocity Graph */}
        <GlassCard style={styles.engineCard} highlight>
          <View style={styles.engineHeader}>
            <View>
              <Text style={styles.engineTitle}>Organic Curve Engine</Text>
              <Text style={styles.engineSubtitle}>Sigmoid Velocity: 850 views/hr (78% FYP Ramp)</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.statusPulse} />
              <Text style={styles.statusPillText}>ACTIVE</Text>
            </View>
          </View>

          {/* SVG S-Curve Chart */}
          <View style={styles.chartContainer}>
            <Svg width="100%" height="90" viewBox="0 0 320 90">
              <Defs>
                <SvgGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#00F2FE" stopOpacity="0.45" />
                  <Stop offset="1" stopColor="#1769FF" stopOpacity="0.0" />
                </SvgGradient>
              </Defs>
              <Path
                d="M0 80 Q 80 75 140 50 T 230 18 T 320 15 L 320 90 L 0 90 Z"
                fill="url(#chartFill)"
              />
              <Path
                d="M0 80 Q 80 75 140 50 T 230 18 T 320 15"
                stroke="#00F2FE"
                strokeWidth="3.5"
                fill="none"
              />
              <Circle cx="230" cy="18" r="5" fill="#FFFFFF" stroke="#00F2FE" strokeWidth="2.5" />
            </Svg>
          </View>

          <View style={styles.engineFooter}>
            <View style={styles.metricItem}>
              <ShieldCheck size={14} color={COLORS.neonGreen} />
              <Text style={styles.metricText}>0/100 Bot Index</Text>
            </View>
            <View style={styles.metricItem}>
              <Layers size={14} color={COLORS.cyan} />
              <Text style={styles.metricText}>4-Signal Synced</Text>
            </View>
            <View style={styles.metricItem}>
              <ArrowUpRight size={14} color={COLORS.blue} />
              <Text style={styles.metricText}>Audit-Proof Pass</Text>
            </View>
          </View>
        </GlassCard>

        {/* Active Orders Summary */}
        <View style={styles.activeOrdersHeader}>
          <Text style={styles.sectionHeading}>ACTIVE CLIP CAMPAIGNS</Text>
          <TouchableOpacity onPress={() => onNavigate('ActiveQueue')}>
            <Text style={styles.viewAllText}>View All ({activeOrders.length})</Text>
          </TouchableOpacity>
        </View>

        {activeOrders.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyOrderCard}
            onPress={() => onNavigate('NewOrder')}
            activeOpacity={0.8}
          >
            <Zap size={22} color={COLORS.cyan} />
            <Text style={styles.emptyOrderTitle}>No active campaigns</Text>
            <Text style={styles.emptyOrderSub}>Tap here to launch your first organic order</Text>
          </TouchableOpacity>
        ) : (
          activeOrders.slice(0, 3).map((order) => {
            const pct = order.totalQuantity > 0
              ? Math.min(100, Math.round((order.deliveredQuantity / order.totalQuantity) * 100))
              : 0;

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItemCard}
                onPress={() => onNavigate('ActiveQueue')}
                activeOpacity={0.8}
              >
                <View style={styles.orderItemRow}>
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderBadgeText}>{order.platform.slice(0, 4)}</Text>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle} numberOfLines={1}>{order.serviceName}</Text>
                    <Text style={styles.orderSub}>
                      Order {order.id} • {order.deliveredQuantity.toLocaleString()} / {order.totalQuantity.toLocaleString()} Views
                    </Text>
                  </View>
                  <View style={styles.orderStatusPill}>
                    <Text style={styles.orderStatusText}>{pct}% Done</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cyan
  },
  walletCard: {
    marginBottom: 20
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  walletLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1
  },
  currencyBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  currencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cyan
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  balanceText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  addFundsBtn: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  addFundsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6
  },
  addFundsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  walletFooter: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.15)',
    paddingTop: 8
  },
  walletFooterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  quickActionsContainer: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  actionTile: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  engineCard: {
    marginBottom: 20
  },
  engineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  engineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  engineSubtitle: {
    fontSize: 11,
    color: COLORS.cyan,
    marginTop: 2,
    fontWeight: '600'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neonGreen
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.neonGreen
  },
  chartContainer: {
    marginVertical: 6,
    height: 90
  },
  engineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.15)',
    paddingTop: 10,
    marginTop: 4
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metricText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  activeOrdersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.cyan
  },
  emptyOrderCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6
  },
  emptyOrderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  emptyOrderSub: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  orderItemCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  orderBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12
  },
  orderBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.cyan
  },
  orderInfo: {
    flex: 1
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  orderSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  orderStatusPill: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan
  }
});
