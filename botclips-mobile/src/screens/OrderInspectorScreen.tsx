import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  CheckCircle2,
  ShieldCheck,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Clock,
  ArrowLeft,
  Sparkles
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { COLORS } from '../constants/theme';

interface OrderInspectorScreenProps {
  orderId?: string;
  onBack: () => void;
}

export const OrderInspectorScreen: React.FC<OrderInspectorScreenProps> = ({
  orderId = '#1901',
  onBack
}) => {
  return (
    <View style={styles.container}>
      <AppHeader subtitle="ORDER REAL-TIME INSPECTOR" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={16} color={COLORS.cyan} />
          <Text style={styles.backText}>Back to Active Queue</Text>
        </TouchableOpacity>

        {/* Order Header Card */}
        <GlassCard highlight style={styles.headerCard}>
          <View style={styles.orderIdRow}>
            <View>
              <Text style={styles.orderLabel}>CAMPAIGN ID</Text>
              <Text style={styles.orderIdVal}>{orderId}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>ACTIVE DISPATCH</Text>
            </View>
          </View>

          <Text style={styles.serviceNameText}>Instagram Reels - Viral S-Curve Paced</Text>
          <Text style={styles.linkText} numberOfLines={1}>
            https://instagram.com/reel/C8xK9Lm12
          </Text>
        </GlassCard>

        {/* Micro-Batch Progress Bar */}
        <Text style={styles.sectionHeading}>MICRO-BATCH DELIVERY PROGRESS (92%)</Text>
        <GlassCard style={styles.progressCard}>
          <View style={styles.stepTrack}>
            <View style={[styles.stepDot, styles.stepDotDone]}>
              <CheckCircle2 size={12} color="#030712" />
            </View>
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepDotDone]}>
              <CheckCircle2 size={12} color="#030712" />
            </View>
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepDotActive]}>
              <Clock size={12} color={COLORS.cyan} />
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepDot}>
              <Text style={styles.stepNum}>4</Text>
            </View>
          </View>

          <View style={styles.stepLabels}>
            <Text style={styles.stepLabelActive}>Warmup</Text>
            <Text style={styles.stepLabelActive}>Breakout</Text>
            <Text style={styles.stepLabelActive}>Delivering</Text>
            <Text style={styles.stepLabel}>Finalizing</Text>
          </View>
        </GlassCard>

        {/* 4-Signal Delivery Metrics */}
        <Text style={styles.sectionHeading}>4-SIGNAL SYNCHRONIZED METRICS</Text>
        <View style={styles.metricsGrid}>
          <GlassCard style={styles.metricCard}>
            <View style={styles.metricIconRow}>
              <Eye size={18} color={COLORS.cyan} />
              <Text style={styles.signalTitle}>Views (100%)</Text>
            </View>
            <Text style={styles.signalDelivered}>9,250</Text>
            <Text style={styles.signalTarget}>Target: 10,000</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <View style={styles.metricIconRow}>
              <Heart size={18} color="#E1306C" />
              <Text style={styles.signalTitle}>Likes (~3.8%)</Text>
            </View>
            <Text style={styles.signalDelivered}>365</Text>
            <Text style={styles.signalTarget}>Target: 380</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <View style={styles.metricIconRow}>
              <Bookmark size={18} color={COLORS.purple} />
              <Text style={styles.signalTitle}>Saves (~1.2%)</Text>
            </View>
            <Text style={styles.signalDelivered}>118</Text>
            <Text style={styles.signalTarget}>Target: 120</Text>
          </GlassCard>

          <GlassCard style={styles.metricCard}>
            <View style={styles.metricIconRow}>
              <Share2 size={18} color={COLORS.neonGreen} />
              <Text style={styles.signalTitle}>Shares (~0.8%)</Text>
            </View>
            <Text style={styles.signalDelivered}>79</Text>
            <Text style={styles.signalTarget}>Target: 80</Text>
          </GlassCard>
        </View>

        {/* Security / Audit Analysis Stamp */}
        <Text style={styles.sectionHeading}>SECURITY & ALGORITHM AUDIT SCORE</Text>
        <GlassCard highlight style={styles.auditCard}>
          <View style={styles.auditStampRow}>
            <ShieldCheck size={28} color={COLORS.neonGreen} />
            <View>
              <Text style={styles.auditStampTitle}>AUDIT-PROOF VERIFIED</Text>
              <Text style={styles.auditStampSubtitle}>0/100 BOT INDEX • ZERO VELOCITY FLAGS</Text>
            </View>
          </View>
          <Text style={styles.auditDesc}>
            Delivery mimics human consumption curves with odd-number jitter variance, ensuring your clip submissions pass all payout verifications.
          </Text>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
    gap: 6
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.cyan
  },
  headerCard: {
    marginBottom: 16
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1
  },
  orderIdVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  statusPill: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan
  },
  serviceNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4
  },
  linkText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10
  },
  progressCard: {
    paddingVertical: 18,
    marginBottom: 16
  },
  stepTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepDotDone: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan
  },
  stepDotActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderColor: COLORS.cyan,
    borderWidth: 2
  },
  stepNum: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700'
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.2)'
  },
  stepLineDone: {
    backgroundColor: COLORS.cyan
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10
  },
  stepLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cyan
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  metricCard: {
    width: '48%',
    padding: 12
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  signalTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  signalDelivered: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  signalTarget: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2
  },
  auditCard: {
    marginBottom: 20
  },
  auditStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  auditStampTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.neonGreen,
    letterSpacing: 1
  },
  auditStampSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.cyan,
    marginTop: 2
  },
  auditDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16
  }
});
