import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BotClipsMascot } from '../components/BotClipsMascot';
import { COLORS } from '../constants/theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={['#030712', '#081020', '#030712']}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        <BotClipsMascot size={110} />

        <View style={styles.logoTextRow}>
          <Text style={styles.botText}>Bot</Text>
          <Text style={styles.clipsText}>Clips</Text>
          <View style={styles.pulseDot} />
        </View>

        <Text style={styles.tagline}>VIRAL AUTOMATION</Text>
        <Text style={styles.subTagline}>Organic Growth & Engagement Engine</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.cyan} />
        <Text style={styles.footerText}>Powered by BotClips AI</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24
  },
  botText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1
  },
  clipsText: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.cyan,
    letterSpacing: -1,
    marginLeft: 4
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
    marginLeft: 8,
    shadowColor: COLORS.cyan,
    shadowRadius: 10,
    shadowOpacity: 1
  },
  tagline: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 3,
    marginTop: 8
  },
  subTagline: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 6
  },
  footer: {
    alignItems: 'center',
    gap: 12
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1
  }
});
