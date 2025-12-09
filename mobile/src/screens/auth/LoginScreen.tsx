import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, borderRadius } from '../../config/theme';
import { Input, Button } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    clearError();
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (!email) {
      setEmailError('Email wajib diisi');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Format email tidak valid');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password wajib diisi');
      hasError = true;
    }

    if (hasError) return;

    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login Gagal', err.message || 'Periksa email dan password Anda');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name="storefront" size={48} color="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>BakoelKu</Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Admin Dashboard Mobile
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.welcomeText, { color: theme.text }]}>
              Selamat Datang! 👋
            </Text>
            <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
              Silakan login untuk menggunakan sistem ini
            </Text>

            <Input
              label="Email"
              placeholder="Masukkan email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={emailError}
            />

            <Input
              label="Password"
              placeholder="Masukkan password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={passwordError}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                Lupa Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.loginButton}
            />

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: theme.error + '20' }]}>
                <Ionicons name="alert-circle" size={20} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <Text style={[styles.footerText, { color: theme.textDisabled }]}>
            © 2024 BakoelKu. All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 14,
  },
  formContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  errorText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 13,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: spacing.xl,
  },
});
