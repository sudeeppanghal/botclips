import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface MascotProps {
  size?: number;
}

export const BotClipsMascot: React.FC<MascotProps> = ({ size = 64 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Ambient Glow */}
      <View style={[styles.glow, { width: size * 1.1, height: size * 1.1 }]} />
      
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="robotGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#38BDF8" />
            <Stop offset="0.5" stopColor="#1769FF" />
            <Stop offset="1" stopColor="#6B3CFF" />
          </LinearGradient>
          <LinearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00F2FE" />
            <Stop offset="1" stopColor="#38BDF8" />
          </LinearGradient>
        </Defs>

        {/* Top Antenna */}
        <Path d="M50 24V12" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
        <Circle cx="50" cy="10" r="5" fill="#00F2FE" />

        {/* Left & Right Ear Pods */}
        <Rect x="14" y="44" width="6" height="18" rx="3" fill="#6B3CFF" />
        <Rect x="80" y="44" width="6" height="18" rx="3" fill="#6B3CFF" />

        {/* Robot Head Body */}
        <Rect x="20" y="24" width="60" height="54" rx="20" fill="url(#robotGrad)" />

        {/* Visor Screen */}
        <Rect x="26" y="32" width="48" height="38" rx="14" fill="#030712" />

        {/* Glowing Eyes */}
        <Circle cx="39" cy="46" r="6" fill="url(#eyeGrad)" />
        <Circle cx="61" cy="46" r="6" fill="url(#eyeGrad)" />
        <Circle cx="41" cy="44" r="2" fill="#FFFFFF" />
        <Circle cx="63" cy="44" r="2" fill="#FFFFFF" />

        {/* Happy Curved Smile */}
        <Path
          d="M40 57C44 62 56 62 60 57"
          stroke="#00F2FE"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 242, 254, 0.25)',
    opacity: 0.8
  }
});
