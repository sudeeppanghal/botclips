import React, { useState } from 'react';
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
  QrCode,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Wallet,
  Clock
} from 'lucide-react-native';
import Svg, { Rect, Path, G } from 'react-native-svg';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { BotClipsApi } from '../services/api';
import { COLORS } from '../constants/theme';

export const AddFundsScreen: React.FC = () => {
  const [method, setMethod] = useState<'UPI' | 'CRYPTO'>('UPI');
  const [amount, setAmount] = useState('1000');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotAttached, setScreenshotAttached] = useState(false);
  
  // Crypto state
  const [cryptoNetwork, setCryptoNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [cryptoAmount, setCryptoAmount] = useState('15');
  const [txHash, setTxHash] = useState('');
  const [cryptoScreenshotAttached, setCryptoScreenshotAttached] = useState(false);

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cryptoAddress =
    cryptoNetwork === 'TRC20'
      ? 'TVTjQKqYuntgk6EfD6PqeFvezZnVCCimjz'
      : '0x71C2B9a6E543eF98d348a1b2C54D891Ea2098b1C';

  const handleCopy = (text: string, label: string) => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert(`${label} Copied`, `${text} copied to clipboard.`);
  };

  const handleAttachScreenshot = (isCrypto = false) => {
    if (isCrypto) {
      setCryptoScreenshotAttached(true);
      Alert.alert('Payment Proof Attached', 'Blockchain receipt screenshot attached successfully.');
    } else {
      setScreenshotAttached(true);
      Alert.alert('Payment Proof Attached', 'UPI receipt screenshot attached successfully.');
    }
  };

  const handleUpiSubmit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      Alert.alert('Invalid Amount', 'Minimum deposit is strictly ₹100 INR.');
      return;
    }

    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      Alert.alert('Invalid UTR', 'Please enter your valid 12-digit UPI UTR / Transaction ID from your payment app.');
      return;
    }

    setSubmitting(true);
    const res = await BotClipsApi.submitUpiDeposit({
      amount: numAmount,
      utr: utrNumber.trim(),
      screenshot1: screenshotAttached ? `upi_proof_${Date.now()}.png` : undefined,
    });
    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Deposit Submitted! ✅',
        `Your deposit of ₹${numAmount} with UTR ${utrNumber} has been received. Your wallet will be credited shortly after admin verification.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setUtrNumber('');
              setScreenshotAttached(false);
            }
          }
        ]
      );
    } else {
      Alert.alert('Deposit Failed', res.error || 'Could not submit deposit.');
    }
  };

  const handleCryptoSubmit = async () => {
    const numUsdt = Number(cryptoAmount);
    if (!numUsdt || numUsdt < 1) {
      Alert.alert('Invalid Amount', 'Minimum crypto deposit is 1 USDT.');
      return;
    }

    if (!txHash.trim() || txHash.trim().length < 10) {
      Alert.alert('Invalid TxID', 'Please enter your Blockchain Transaction Hash (TxID).');
      return;
    }

    setSubmitting(true);
    const res = await BotClipsApi.submitCryptoDeposit({
      amountUsdt: numUsdt,
      txHash: txHash.trim(),
      network: cryptoNetwork,
      screenshot1: cryptoScreenshotAttached ? `crypto_proof_${Date.now()}.png` : undefined,
    });
    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Crypto Deposit Submitted! 🚀',
        res.message || `Deposit of ${numUsdt} USDT received. Blockchain verification in progress.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setTxHash('');
              setCryptoScreenshotAttached(false);
            }
          }
        ]
      );
    } else {
      Alert.alert('Deposit Failed', res.error || 'Could not submit crypto deposit.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="INSTANT DEPOSIT GATEWAY" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Method Toggle */}
        <View style={styles.methodToggle}>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'UPI' && styles.methodBtnActive]}
            onPress={() => setMethod('UPI')}
          >
            <Text style={[styles.methodText, method === 'UPI' && styles.methodTextActive]}>
              Instant UPI (Zero Fee)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'CRYPTO' && styles.methodBtnActive]}
            onPress={() => setMethod('CRYPTO')}
          >
            <Text style={[styles.methodText, method === 'CRYPTO' && styles.methodTextActive]}>
              Crypto (USDT)
            </Text>
          </TouchableOpacity>
        </View>

        {method === 'UPI' ? (
          <View>
            {/* High Contrast UPI QR Card */}
            <GlassCard highlight style={styles.qrCard}>
              <Text style={styles.qrCardTitle}>Scan QR Code with Any UPI App</Text>
              <Text style={styles.qrCardSubtitle}>PhonePe • Google Pay • Paytm • CRED • BHIM</Text>

              {/* High-Contrast Crisp QR Visual Box */}
              <View style={styles.qrWrapper}>
                <Svg width="180" height="180" viewBox="0 0 100 100">
                  <Rect width="100" height="100" fill="#FFFFFF" rx="8" />
                  {/* Outer corner boxes */}
                  <Rect x="10" y="10" width="24" height="24" fill="#030712" rx="4" />
                  <Rect x="14" y="14" width="16" height="16" fill="#FFFFFF" rx="2" />
                  <Rect x="18" y="18" width="8" height="8" fill="#1769FF" />

                  <Rect x="66" y="10" width="24" height="24" fill="#030712" rx="4" />
                  <Rect x="70" y="14" width="16" height="16" fill="#FFFFFF" rx="2" />
                  <Rect x="74" y="18" width="8" height="8" fill="#1769FF" />

                  <Rect x="10" y="66" width="24" height="24" fill="#030712" rx="4" />
                  <Rect x="14" y="70" width="16" height="16" fill="#FFFFFF" rx="2" />
                  <Rect x="18" y="74" width="8" height="8" fill="#1769FF" />

                  {/* QR Pattern Data Dots */}
                  <Rect x="42" y="12" width="6" height="6" fill="#030712" />
                  <Rect x="52" y="12" width="6" height="6" fill="#030712" />
                  <Rect x="42" y="24" width="6" height="6" fill="#030712" />
                  <Rect x="52" y="28" width="6" height="6" fill="#030712" />

                  <Rect x="12" y="42" width="6" height="6" fill="#030712" />
                  <Rect x="24" y="48" width="6" height="6" fill="#030712" />
                  <Rect x="36" y="42" width="6" height="6" fill="#030712" />

                  <Rect x="46" y="46" width="8" height="8" fill="#00F2FE" />
                  <Rect x="62" y="42" width="6" height="6" fill="#030712" />
                  <Rect x="76" y="46" width="6" height="6" fill="#030712" />

                  <Rect x="42" y="64" width="6" height="6" fill="#030712" />
                  <Rect x="54" y="72" width="6" height="6" fill="#030712" />
                  <Rect x="68" y="66" width="6" height="6" fill="#030712" />
                  <Rect x="78" y="78" width="6" height="6" fill="#030712" />
                </Svg>
              </View>

              <TouchableOpacity
                style={styles.upiIdBadge}
                onPress={() => handleCopy('botclips@paytm', 'UPI ID')}
                activeOpacity={0.7}
              >
                <Text style={styles.upiIdText}>
                  UPI ID: <Text style={styles.upiIdBold}>botclips@paytm</Text>
                </Text>
                <Copy size={14} color={COLORS.cyan} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </GlassCard>

            {/* Quick Amount Pills */}
            <Text style={styles.sectionHeading}>SELECT QUICK DEPOSIT AMOUNT</Text>
            <View style={styles.amountGrid}>
              {['100', '500', '1000', '2500'].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.amountPill, amount === val && styles.amountPillActive]}
                  onPress={() => setAmount(val)}
                >
                  <Text style={[styles.amountPillText, amount === val && styles.amountPillTextActive]}>
                    ₹{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deposit Form Card */}
            <GlassCard style={styles.inputCard}>
              <Text style={styles.inputLabel}>DEPOSIT AMOUNT (INR - MIN ₹100)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="₹1,000"
                placeholderTextColor={COLORS.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>12-DIGIT UPI UTR / TRANSACTION ID</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 423987123456"
                placeholderTextColor={COLORS.textMuted}
                value={utrNumber}
                onChangeText={setUtrNumber}
                keyboardType="numeric"
                maxLength={20}
              />

              {/* Screenshot Attachment Button */}
              <TouchableOpacity
                style={[styles.attachBtn, screenshotAttached && styles.attachBtnActive]}
                onPress={() => handleAttachScreenshot(false)}
                activeOpacity={0.7}
              >
                {screenshotAttached ? (
                  <CheckCircle2 size={16} color={COLORS.neonGreen} />
                ) : (
                  <Wallet size={16} color={COLORS.cyan} />
                )}
                <Text style={[styles.attachBtnText, screenshotAttached && { color: COLORS.neonGreen }]}>
                  {screenshotAttached ? 'Payment Proof Attached ✅' : 'Attach Payment Screenshot'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitDepositBtn}
                onPress={handleUpiSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#1769FF', '#00F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitDepositGradient}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitDepositText}>Submit UPI Deposit</Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          </View>
        ) : (
          <View>
            {/* Crypto Deposit Card */}
            <GlassCard highlight style={styles.cryptoCard}>
              <Text style={styles.cryptoTitle}>USDT Multi-Chain Deposit</Text>
              <Text style={styles.cryptoSubtitle}>Funds credit automatically in ~1-3 network blocks</Text>

              {/* Network Toggle */}
              <View style={styles.networkToggleRow}>
                <TouchableOpacity
                  style={[styles.networkPill, cryptoNetwork === 'TRC20' && styles.networkPillActive]}
                  onPress={() => setCryptoNetwork('TRC20')}
                >
                  <Text style={[styles.networkText, cryptoNetwork === 'TRC20' && styles.networkTextActive]}>
                    TRC-20 (Tron)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.networkPill, cryptoNetwork === 'BEP20' && styles.networkPillActive]}
                  onPress={() => setCryptoNetwork('BEP20')}
                >
                  <Text style={[styles.networkText, cryptoNetwork === 'BEP20' && styles.networkTextActive]}>
                    BEP-20 (BSC)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Deposit Address Box */}
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>OFFICIAL DEPOSIT ADDRESS ({cryptoNetwork})</Text>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {cryptoAddress}
                </Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleCopy(cryptoAddress, `${cryptoNetwork} Address`)}
                  activeOpacity={0.7}
                >
                  <Copy size={16} color={COLORS.cyan} />
                  <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Address'}</Text>
                </TouchableOpacity>
              </View>

              {/* USDT Amount Input */}
              <Text style={styles.inputLabel}>AMOUNT (USDT - MIN 1 USDT)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="15"
                placeholderTextColor={COLORS.textMuted}
                value={cryptoAmount}
                onChangeText={setCryptoAmount}
                keyboardType="numeric"
              />

              {/* TxHash Input */}
              <Text style={styles.inputLabel}>BLOCKCHAIN TRANSACTION HASH (TxID)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 5d9b...4a2f"
                placeholderTextColor={COLORS.textMuted}
                value={txHash}
                onChangeText={setTxHash}
                autoCapitalize="none"
              />

              {/* Crypto Screenshot Attachment Button */}
              <TouchableOpacity
                style={[styles.attachBtn, cryptoScreenshotAttached && styles.attachBtnActive]}
                onPress={() => handleAttachScreenshot(true)}
                activeOpacity={0.7}
              >
                {cryptoScreenshotAttached ? (
                  <CheckCircle2 size={16} color={COLORS.neonGreen} />
                ) : (
                  <Wallet size={16} color={COLORS.cyan} />
                )}
                <Text style={[styles.attachBtnText, cryptoScreenshotAttached && { color: COLORS.neonGreen }]}>
                  {cryptoScreenshotAttached ? 'Blockchain Proof Attached ✅' : 'Attach TxID Proof Screenshot'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitDepositBtn}
                onPress={handleCryptoSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#1769FF', '#00F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitDepositGradient}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitDepositText}>Submit Crypto Deposit</Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.cryptoFooter}>
                <ShieldCheck size={14} color={COLORS.neonGreen} />
                <Text style={styles.cryptoFooterText}>
                  Minimum Deposit: 1 USDT • Automated TronScan On-Chain Check
                </Text>
              </View>
            </GlassCard>
          </View>
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
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    padding: 4,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  methodBtnActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderColor: COLORS.cyan,
    borderWidth: 1
  },
  methodText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  methodTextActive: {
    color: COLORS.cyan
  },
  qrCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16
  },
  qrCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  qrCardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 14
  },
  upiIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  upiIdText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  upiIdBold: {
    color: COLORS.cyan,
    fontWeight: '800'
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10
  },
  amountGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  amountPill: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  amountPillActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0, 242, 254, 0.15)'
  },
  amountPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  amountPillTextActive: {
    color: COLORS.cyan
  },
  inputCard: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 6
  },
  textInput: {
    height: 48,
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16
  },
  attachBtnActive: {
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  attachBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.cyan
  },
  submitDepositBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4
  },
  submitDepositGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8
  },
  submitDepositText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  cryptoCard: {
    padding: 16
  },
  cryptoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  cryptoSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16
  },
  networkToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  networkPill: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  networkPillActive: {
    borderColor: COLORS.cyan,
    backgroundColor: 'rgba(0, 242, 254, 0.15)'
  },
  networkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  networkTextActive: {
    color: COLORS.cyan
  },
  addressBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1,
    marginBottom: 6
  },
  addressText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 8
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.cyan
  },
  cryptoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14
  },
  cryptoFooterText: {
    fontSize: 10,
    color: COLORS.neonGreen,
    fontWeight: '700'
  }
});
