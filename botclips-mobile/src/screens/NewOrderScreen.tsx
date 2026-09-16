import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Link2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { BotClipsApi } from '../services/api';
import { PlatformCurveType, PlatformType, ServiceItem } from '../types';
import { COLORS } from '../constants/theme';

interface NewOrderScreenProps {
  onOrderSuccess: (orderId: string) => void;
}

export const NewOrderScreen: React.FC<NewOrderScreenProps> = ({ onOrderSuccess }) => {
  const [platform, setPlatform] = useState<PlatformType>('INSTAGRAM');
  const [curveType, setCurveType] = useState<PlatformCurveType>('TIKTOK_REELS_S_CURVE');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  const loadServices = async (targetPlatform: string) => {
    setLoadingServices(true);
    const data = await BotClipsApi.getServices(targetPlatform);
    setServices(data);
    if (data.length > 0) {
      setSelectedService(data[0]);
    } else {
      setSelectedService(null);
    }
    setLoadingServices(false);
  };

  useEffect(() => {
    loadServices(platform);
  }, [platform]);

  const numQty = parseInt(quantity, 10) || 0;
  const estLikes = Math.round(numQty * 0.038);
  const estSaves = Math.round(numQty * 0.012);
  const estShares = Math.round(numQty * 0.008);
  const rate = selectedService?.rate ?? 20.00;
  const estimatedCostINR = (numQty / 1000) * rate;

  const handlePlaceOrder = async () => {
    if (!link.trim()) {
      Alert.alert('Missing Video URL', 'Please enter your clip URL to initiate organic delivery.');
      return;
    }
    if (numQty < (selectedService?.min || 100)) {
      Alert.alert('Minimum Quantity', `Minimum order quantity is ${(selectedService?.min || 100).toLocaleString()} views.`);
      return;
    }
    if (!selectedService) {
      Alert.alert('No Service Selected', 'Please select a service before placing your order.');
      return;
    }

    setLoading(true);
    const res = await BotClipsApi.createOrder({
      serviceId: selectedService.serviceId || selectedService.id,
      link: link.trim(),
      quantity: numQty,
      curveType,
      charge: estimatedCostINR
    });
    setLoading(false);

    if (res.success && res.orderId) {
      Alert.alert(
        '🚀 Order Launched Successfully',
        `Order ${res.orderId} is now active and pacing organic engagement batches.`,
        [{ text: 'View Active Queue', onPress: () => onOrderSuccess(res.orderId!) }]
      );
    } else {
      Alert.alert('Order Failed', res.error || 'Failed to place order. Please check your wallet balance.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="MULTI-SIGNAL ORDER STUDIO" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Platform Selector */}
        <Text style={styles.sectionHeading}>SELECT PLATFORM</Text>
        <View style={styles.platformGrid}>
          <TouchableOpacity
            style={[styles.platformCard, platform === 'INSTAGRAM' && styles.platformCardActive]}
            onPress={() => {
              setPlatform('INSTAGRAM');
              setCurveType('TIKTOK_REELS_S_CURVE');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.platformIconCircle, { backgroundColor: '#E1306C' }]}>
              <Text style={styles.platformIconText}>IG</Text>
            </View>
            <Text style={styles.platformName}>Instagram Reels</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.platformCard, platform === 'TIKTOK' && styles.platformCardActive]}
            onPress={() => {
              setPlatform('TIKTOK');
              setCurveType('TIKTOK_REELS_S_CURVE');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.platformIconCircle, { backgroundColor: '#000000', borderWidth: 1, borderColor: COLORS.cyan }]}>
              <Text style={[styles.platformIconText, { color: COLORS.cyan }]}>TT</Text>
            </View>
            <Text style={styles.platformName}>TikTok FYP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.platformCard, platform === 'YOUTUBE' && styles.platformCardActive]}
            onPress={() => {
              setPlatform('YOUTUBE');
              setCurveType('YOUTUBE_SHORTS_DRIP');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.platformIconCircle, { backgroundColor: '#FF0000' }]}>
              <Text style={styles.platformIconText}>YT</Text>
            </View>
            <Text style={styles.platformName}>YouTube Shorts</Text>
          </TouchableOpacity>
        </View>

        {/* Available Live Services Selection */}
        <Text style={styles.sectionHeading}>SELECT SERVICE & PRICING</Text>
        {loadingServices ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.cyan} />
            <Text style={styles.loadingText}>Loading live database catalog...</Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No services active for this platform.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicePickerRow}>
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.servicePill, isSelected && styles.servicePillActive]}
                  onPress={() => setSelectedService(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.servicePillName, isSelected && styles.servicePillNameActive]} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={styles.servicePillRate}>₹{s.rate.toFixed(2)}/1K</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Delivery Strategy Selector */}
        <Text style={styles.sectionHeading}>ALGORITHMIC CURVE STRATEGY</Text>
        <GlassCard highlight style={styles.strategyCard}>
          <View style={styles.strategyToggleRow}>
            <TouchableOpacity
              style={[
                styles.strategyPill,
                curveType === 'TIKTOK_REELS_S_CURVE' && styles.strategyPillActive
              ]}
              onPress={() => setCurveType('TIKTOK_REELS_S_CURVE')}
            >
              <Text style={[styles.strategyPillText, curveType === 'TIKTOK_REELS_S_CURVE' && styles.strategyPillTextActive]}>
                Viral S-Curve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.strategyPill,
                curveType === 'YOUTUBE_SHORTS_DRIP' && styles.strategyPillActive
              ]}
              onPress={() => setCurveType('YOUTUBE_SHORTS_DRIP')}
            >
              <Text style={[styles.strategyPillText, curveType === 'YOUTUBE_SHORTS_DRIP' && styles.strategyPillTextActive]}>
                Steady Drip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.strategyPill,
                curveType === 'WHOP_PAYOUT_BLITZ' && styles.strategyPillActive
              ]}
              onPress={() => setCurveType('WHOP_PAYOUT_BLITZ')}
            >
              <Text style={[styles.strategyPillText, curveType === 'WHOP_PAYOUT_BLITZ' && styles.strategyPillTextActive]}>
                Whop Blitz
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.strategyDescription}>
            <TrendingUp size={14} color={COLORS.cyan} />
            <Text style={styles.strategyDescText}>
              {curveType === 'TIKTOK_REELS_S_CURVE' && 'Sigmoid mathematical distribution mimicking natural organic breakout.'}
              {curveType === 'YOUTUBE_SHORTS_DRIP' && 'Poisson micro-drips over 6h-24h bypassing Shorts velocity audit filters.'}
              {curveType === 'WHOP_PAYOUT_BLITZ' && 'High-frequency 2-4h delivery for contest deadlines with 0/100 bot index.'}
            </Text>
          </View>
        </GlassCard>

        {/* 4-Signal Organic Ratio Dials */}
        <Text style={styles.sectionHeading}>SYNCHRONIZED 4-SIGNAL RATIO</Text>
        <GlassCard style={styles.signalCard}>
          <View style={styles.signalGrid}>
            <View style={styles.signalItem}>
              <View style={[styles.signalDial, { borderColor: COLORS.cyan }]}>
                <Eye size={18} color={COLORS.cyan} />
              </View>
              <Text style={styles.signalValue}>100%</Text>
              <Text style={styles.signalLabel}>Views</Text>
              <Text style={styles.signalCount}>{numQty.toLocaleString()}</Text>
            </View>

            <View style={styles.signalItem}>
              <View style={[styles.signalDial, { borderColor: '#E1306C' }]}>
                <Heart size={18} color="#E1306C" />
              </View>
              <Text style={styles.signalValue}>~3.8%</Text>
              <Text style={styles.signalLabel}>Likes</Text>
              <Text style={styles.signalCount}>+{estLikes.toLocaleString()}</Text>
            </View>

            <View style={styles.signalItem}>
              <View style={[styles.signalDial, { borderColor: COLORS.purple }]}>
                <Bookmark size={18} color={COLORS.purple} />
              </View>
              <Text style={styles.signalValue}>~1.2%</Text>
              <Text style={styles.signalLabel}>Saves</Text>
              <Text style={styles.signalCount}>+{estSaves.toLocaleString()}</Text>
            </View>

            <View style={styles.signalItem}>
              <View style={[styles.signalDial, { borderColor: COLORS.neonGreen }]}>
                <Share2 size={18} color={COLORS.neonGreen} />
              </View>
              <Text style={styles.signalValue}>~0.8%</Text>
              <Text style={styles.signalLabel}>Shares</Text>
              <Text style={styles.signalCount}>+{estShares.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.signalFooter}>
            <ShieldCheck size={14} color={COLORS.neonGreen} />
            <Text style={styles.signalFooterText}>All 4 signals auto-flushed on milestone accumulator</Text>
          </View>
        </GlassCard>

        {/* Input Details */}
        <Text style={styles.sectionHeading}>TARGET VIDEO & QUANTITY</Text>
        <GlassCard style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>VIDEO LINK / URL</Text>
            <View style={styles.inputWrapper}>
              <Link2 size={18} color={COLORS.cyan} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="https://instagram.com/reel/..."
                placeholderTextColor={COLORS.textMuted}
                value={link}
                onChangeText={setLink}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>QUANTITY (VIEWS)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="10000"
                placeholderTextColor={COLORS.textMuted}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Quick Quantity Pills */}
          <View style={styles.qtyPillRow}>
            {['1000', '5000', '10000', '25000', '50000'].map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.qtyPill, quantity === q && styles.qtyPillActive]}
                onPress={() => setQuantity(q)}
              >
                <Text style={[styles.qtyPillText, quantity === q && styles.qtyPillTextActive]}>
                  {parseInt(q, 10) >= 1000 ? `${parseInt(q, 10) / 1000}k` : q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Price & Order Action */}
        <View style={styles.priceContainer}>
          <View style={styles.priceDetails}>
            <Text style={styles.priceLabel}>TOTAL ESTIMATED CHARGE</Text>
            <Text style={styles.priceValue}>₹{estimatedCostINR.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.placeOrderBtn}
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1769FF', '#00F2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.placeOrderGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={18} color="#FFFFFF" />
                  <Text style={styles.placeOrderText}>Place Organic Order</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 50
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 10
  },
  platformGrid: {
    flexDirection: 'row',
    gap: 10
  },
  platformCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  platformCardActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0, 242, 254, 0.1)'
  },
  platformIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  platformIconText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  platformName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  emptyBox: {
    padding: 16,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  servicePickerRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  servicePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    maxWidth: 200
  },
  servicePillActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0, 242, 254, 0.15)'
  },
  servicePillName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  servicePillNameActive: {
    color: '#FFFFFF'
  },
  servicePillRate: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    marginTop: 2
  },
  strategyCard: {
    padding: 4
  },
  strategyToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 4,
    gap: 4
  },
  strategyPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  strategyPillActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.2)',
    borderColor: COLORS.cyan,
    borderWidth: 1
  },
  strategyPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  strategyPillTextActive: {
    color: COLORS.cyan
  },
  strategyDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
    paddingHorizontal: 8
  },
  strategyDescText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16
  },
  signalCard: {
    padding: 4
  },
  signalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  signalItem: {
    alignItems: 'center',
    flex: 1
  },
  signalDial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    marginBottom: 6
  },
  signalValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  signalLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  signalCount: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.cyan,
    marginTop: 2
  },
  signalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.15)',
    paddingTop: 8,
    marginTop: 8,
    gap: 6
  },
  signalFooterText: {
    fontSize: 10,
    color: COLORS.neonGreen,
    fontWeight: '700'
  },
  inputCard: {
    marginBottom: 10
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    height: 46,
    color: '#FFFFFF',
    fontSize: 13
  },
  qtyPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  qtyPill: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center'
  },
  qtyPillActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0, 242, 254, 0.15)'
  },
  qtyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  qtyPillTextActive: {
    color: COLORS.cyan
  },
  priceContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginTop: 10
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.cyan
  },
  placeOrderBtn: {
    borderRadius: 14,
    overflow: 'hidden'
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8
  },
  placeOrderText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
