import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  ShieldCheck,
  TrendingUp,
  Award,
  Share2,
  Send,
  MessageCircle,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { COLORS } from '../constants/theme';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const referralLink = 'https://botclips.online/ref/clipper77';

  const handleShareWhatsApp = () => {
    Alert.alert('Share Link', `Referral link copied to WhatsApp share intent: ${referralLink}`);
  };

  const handleShareTelegram = () => {
    Alert.alert('Share Link', `Referral link copied to Telegram share intent: ${referralLink}`);
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="CLIPPER REVENUE & PROFILE" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <GlassCard highlight style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarBox}>
              <User size={30} color={COLORS.cyan} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>Alex Rivera</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color={COLORS.neonGreen} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.profileEmail}>alex.clipper@botclips.online</Text>
              <Text style={styles.profileRank}>Diamond Tier Clipper #77</Text>
            </View>
          </View>
        </GlassCard>

        {/* Whop Clipper Payouts Analytics */}
        <Text style={styles.sectionHeading}>WHOP CLIPPER EARNINGS & PAYOUTS</Text>
        <GlassCard highlight style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <View>
              <Text style={styles.earningsLabel}>TOTAL CLIPPER REVENUE</Text>
              <Text style={styles.earningsAmount}>$338.4K</Text>
            </View>
            <View style={styles.growthPill}>
              <TrendingUp size={12} color={COLORS.neonGreen} />
              <Text style={styles.growthText}>+$38.4K this month</Text>
            </View>
          </View>

          {/* SVG Payout Chart */}
          <View style={styles.chartBox}>
            <Svg width="100%" height="90" viewBox="0 0 320 90">
              <Defs>
                <SvgGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#00F2FE" stopOpacity="0.5" />
                  <Stop offset="1" stopColor="#6B3CFF" stopOpacity="0.0" />
                </SvgGradient>
              </Defs>
              <Path
                d="M0 75 Q 80 65 140 45 T 220 28 T 320 12 L 320 90 L 0 90 Z"
                fill="url(#payoutGrad)"
              />
              <Path
                d="M0 75 Q 80 65 140 45 T 220 28 T 320 12"
                stroke="#00F2FE"
                strokeWidth="3.5"
                fill="none"
              />
              <Circle cx="320" cy="12" r="5" fill="#FFFFFF" stroke="#00F2FE" strokeWidth="2.5" />
            </Svg>
          </View>

          <View style={styles.milestoneRow}>
            <Award size={16} color={COLORS.cyan} />
            <Text style={styles.milestoneText}>
              Next Goal: $500K • Progress: 76% to Grandmaster Bounty
            </Text>
          </View>
        </GlassCard>

        {/* Referral Program */}
        <Text style={styles.sectionHeading}>REFERRAL & COMMISSION (EARN 10%)</Text>
        <GlassCard style={styles.referralCard}>
          <Text style={styles.referralTitle}>Invite Fellow Clippers</Text>
          <Text style={styles.referralSubtitle}>
            Earn 10% instant lifetime commission on all deposits made by your invited clippers.
          </Text>

          <View style={styles.shareButtonsRow}>
            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: '#25D366' }]}
              onPress={handleShareWhatsApp}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: '#229ED9' }]}
              onPress={handleShareTelegram}
              activeOpacity={0.8}
            >
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share Telegram</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Logout CTA */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <LogOut size={16} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out from BotClips</Text>
        </TouchableOpacity>
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
  profileCard: {
    marginTop: 10,
    marginBottom: 16
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.neonGreen
  },
  profileEmail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  profileRank: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cyan,
    marginTop: 3
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10
  },
  earningsCard: {
    marginBottom: 16
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  earningsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2
  },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  growthText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.neonGreen
  },
  chartBox: {
    marginVertical: 8,
    height: 90
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.15)',
    paddingTop: 8,
    marginTop: 4
  },
  milestoneText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  referralCard: {
    marginBottom: 20
  },
  referralTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  referralSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 14
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger
  }
});
