import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';
import { BotClipsMascot } from './BotClipsMascot';
import { COLORS } from '../constants/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showMascot?: boolean;
  onNotificationPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'BotClips',
  subtitle = 'VIRAL AUTOMATION',
  showMascot = true,
  onNotificationPress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showMascot && <BotClipsMascot size={38} />}
        <View style={styles.titleContainer}>
          <View style={styles.brandRow}>
            <Text style={styles.brandBot}>Bot</Text>
            <Text style={styles.brandClips}>Clips</Text>
            <View style={styles.livePulseDot} />
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Bell size={20} color={COLORS.textPrimary} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.bgDark
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  titleContainer: {
    justifyContent: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandBot: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  brandClips: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.cyan,
    letterSpacing: -0.5,
    marginLeft: 2
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
    marginLeft: 6,
    shadowColor: COLORS.cyan,
    shadowRadius: 6,
    shadowOpacity: 1
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1.5,
    marginTop: 1
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.cyan
  }
});
