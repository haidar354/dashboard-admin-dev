import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, borderRadius } from '../../config/theme';
import { Card, ListItem } from '../../components/ui';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark, mode, setMode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const theme = isDark ? colors.dark : colors.light;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (mode) {
      case 'light': return 'Terang';
      case 'dark': return 'Gelap';
      case 'system': return 'Sistem';
      default: return 'Sistem';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        </View>

        {/* User Profile */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Admin'}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'admin@example.com'}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Tampilan</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Mode Gelap</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{getThemeLabel()}</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Menu Lainnya</Text>
        <Card style={styles.settingsCard}>
          <ListItem
            title="Error Logs"
            leftIcon="bug-outline"
            leftIconColor={theme.error}
            onPress={() => navigation.navigate('ErrorLogs')}
          />
          <ListItem
            title="Monitoring"
            leftIcon="pulse-outline"
            leftIconColor={theme.info}
            onPress={() => navigation.navigate('Monitoring')}
          />
          <ListItem
            title="Modules"
            leftIcon="apps-outline"
            leftIconColor={theme.primary}
            onPress={() => navigation.navigate('Modules')}
          />
          <ListItem
            title="Permissions"
            leftIcon="key-outline"
            leftIconColor={theme.warning}
            onPress={() => navigation.navigate('Permissions')}
            showDivider={false}
          />
        </Card>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Tentang</Text>
        <Card style={styles.settingsCard}>
          <ListItem
            title="Versi Aplikasi"
            subtitle="1.0.0"
            leftIcon="information-circle-outline"
            leftIconColor={theme.textSecondary}
          />
          <ListItem
            title="Kebijakan Privasi"
            leftIcon="shield-checkmark-outline"
            leftIconColor={theme.textSecondary}
            onPress={() => {}}
          />
          <ListItem
            title="Syarat & Ketentuan"
            leftIcon="document-text-outline"
            leftIconColor={theme.textSecondary}
            onPress={() => {}}
            showDivider={false}
          />
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.error + '10' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: theme.textDisabled }]}>
          © 2024 BakoelKu. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  profileCard: { marginHorizontal: spacing.md, marginTop: spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '600' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '600' },
  userEmail: { fontSize: 14, marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  settingsCard: { marginHorizontal: spacing.md },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingValue: { fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  logoutText: { fontSize: 16, fontWeight: '600', marginLeft: spacing.sm },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
