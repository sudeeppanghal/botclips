import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  Home,
  Zap,
  Clock,
  Layers,
  Wallet,
  User
} from 'lucide-react-native';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { NewOrderScreen } from '../screens/NewOrderScreen';
import { ActiveQueueScreen } from '../screens/ActiveQueueScreen';
import { AddFundsScreen } from '../screens/AddFundsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { OrderInspectorScreen } from '../screens/OrderInspectorScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../constants/theme';

export type ScreenType =
  | 'Splash'
  | 'Auth'
  | 'Dashboard'
  | 'NewOrder'
  | 'ActiveQueue'
  | 'AddFunds'
  | 'Services'
  | 'OrderInspector'
  | 'Profile';

export const RootNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Splash');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('#1901');

  if (currentScreen === 'Splash') {
    return <SplashScreen onFinish={() => setCurrentScreen('Dashboard')} />;
  }

  if (currentScreen === 'Auth') {
    return <AuthScreen onLoginSuccess={() => setCurrentScreen('Dashboard')} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={(s) => setCurrentScreen(s as ScreenType)} />;
      case 'NewOrder':
        return (
          <NewOrderScreen
            onOrderSuccess={(orderId) => {
              setSelectedOrderId(orderId);
              setCurrentScreen('ActiveQueue');
            }}
          />
        );
      case 'ActiveQueue':
        return (
          <ActiveQueueScreen
            onInspectOrder={(orderId) => {
              setSelectedOrderId(orderId);
              setCurrentScreen('OrderInspector');
            }}
          />
        );
      case 'OrderInspector':
        return (
          <OrderInspectorScreen
            orderId={selectedOrderId}
            onBack={() => setCurrentScreen('ActiveQueue')}
          />
        );
      case 'AddFunds':
        return <AddFundsScreen />;
      case 'Services':
        return (
          <ServicesScreen
            onSelectService={() => {
              setCurrentScreen('NewOrder');
            }}
          />
        );
      case 'Profile':
        return <ProfileScreen onLogout={() => setCurrentScreen('Auth')} />;
      default:
        return <DashboardScreen onNavigate={(s) => setCurrentScreen(s as ScreenType)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {renderScreen()}

        {/* Custom Glowing Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('Dashboard')}
            activeOpacity={0.7}
          >
            <Home
              size={20}
              color={currentScreen === 'Dashboard' ? COLORS.cyan : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                currentScreen === 'Dashboard' && styles.navLabelActive
              ]}
            >
              Home
            </Text>
            {currentScreen === 'Dashboard' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('NewOrder')}
            activeOpacity={0.7}
          >
            <Zap
              size={20}
              color={currentScreen === 'NewOrder' ? COLORS.cyan : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                currentScreen === 'NewOrder' && styles.navLabelActive
              ]}
            >
              Order
            </Text>
            {currentScreen === 'NewOrder' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('ActiveQueue')}
            activeOpacity={0.7}
          >
            <Clock
              size={20}
              color={
                currentScreen === 'ActiveQueue' || currentScreen === 'OrderInspector'
                  ? COLORS.cyan
                  : COLORS.textMuted
              }
            />
            <Text
              style={[
                styles.navLabel,
                (currentScreen === 'ActiveQueue' || currentScreen === 'OrderInspector') &&
                  styles.navLabelActive
              ]}
            >
              Queue
            </Text>
            {(currentScreen === 'ActiveQueue' || currentScreen === 'OrderInspector') && (
              <View style={styles.activeDot} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('Services')}
            activeOpacity={0.7}
          >
            <Layers
              size={20}
              color={currentScreen === 'Services' ? COLORS.cyan : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                currentScreen === 'Services' && styles.navLabelActive
              ]}
            >
              Services
            </Text>
            {currentScreen === 'Services' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('AddFunds')}
            activeOpacity={0.7}
          >
            <Wallet
              size={20}
              color={currentScreen === 'AddFunds' ? COLORS.cyan : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                currentScreen === 'AddFunds' && styles.navLabelActive
              ]}
            >
              Wallet
            </Text>
            {currentScreen === 'AddFunds' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setCurrentScreen('Profile')}
            activeOpacity={0.7}
          >
            <User
              size={20}
              color={currentScreen === 'Profile' ? COLORS.cyan : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                currentScreen === 'Profile' && styles.navLabelActive
              ]}
            >
              Profile
            </Text>
            {currentScreen === 'Profile' && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgDark
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 18, 32, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 4
  },
  navLabelActive: {
    color: COLORS.cyan
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cyan,
    marginTop: 3,
    shadowColor: COLORS.cyan,
    shadowRadius: 4,
    shadowOpacity: 1
  }
});
