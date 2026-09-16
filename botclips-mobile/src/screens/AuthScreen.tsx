import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, LogIn, Send, Chrome } from 'lucide-react-native';
import { BotClipsMascot } from '../components/BotClipsMascot';
import { GlassCard } from '../components/GlassCard';
import { BotClipsApi } from '../services/api';
import { COLORS } from '../constants/theme';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name to register.');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const res = await BotClipsApi.login(email.trim(), password.trim());
      setLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        Alert.alert('Login Failed', res.error || 'Invalid email or password.');
      }
    } else {
      const res = await BotClipsApi.register(name.trim(), email.trim(), password.trim());
      setLoading(false);
      if (res.success) {
        Alert.alert('Account Created', 'Welcome to BotClips! Your account is active.', [
          { text: 'Continue', onPress: onLoginSuccess }
        ]);
      } else {
        Alert.alert('Registration Failed', res.error || 'Could not create account.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BotClipsMascot size={70} />
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Login to automate and scale your viral clips'
              : 'Join BotClips to start organic short-form automation'}
          </Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLogin && styles.tabActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLogin && styles.tabActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Form Card */}
        <GlassCard style={styles.formCard} highlight>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={COLORS.cyan} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Alex Rivera"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={COLORS.cyan} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="clipper@botclips.online"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.cyan} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1769FF', '#00F2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                  <LogIn size={18} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* Social / 1-Tap Connect */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => {
              Alert.alert('Google Sign-In', 'Please log in with your registered email and password.');
            }}
          >
            <Chrome size={18} color={COLORS.cyan} />
            <Text style={styles.socialButtonText}>Google Sign-In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => {
              Alert.alert('Telegram Sign-In', 'Please log in with your registered email and password.');
            }}
          >
            <Send size={18} color={COLORS.blue} />
            <Text style={styles.socialButtonText}>Telegram Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  tabActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderColor: COLORS.cyan,
    borderWidth: 1
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  tabTextActive: {
    color: COLORS.cyan
  },
  formCard: {
    marginBottom: 24
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1,
    marginBottom: 8
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
    height: 48,
    color: '#FFFFFF',
    fontSize: 14
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 16
  },
  forgotPassText: {
    fontSize: 12,
    color: COLORS.cyan,
    fontWeight: '600'
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8
  },
  submitText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.2)'
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginHorizontal: 12,
    letterSpacing: 1
  },
  socialButtonsContainer: {
    gap: 12
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
