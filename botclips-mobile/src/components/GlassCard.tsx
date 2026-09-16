import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, highlight = false }) => {
  return (
    <View style={[styles.outerContainer, highlight && styles.highlightBorder, style]}>
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.75)', 'rgba(15, 23, 42, 0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerGradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  highlightBorder: {
    borderColor: 'rgba(0, 242, 254, 0.6)',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8
  },
  innerGradient: {
    padding: 16,
    borderRadius: 19
  }
});
