import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/themeStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, borderRadius } from '../../config/theme';
import { Card, Loading, Chip } from '../../components/ui';
import { StatCard, LineChart, BarChart, DonutChart } from '../../components/charts';
import { Ionicons } from '@expo/vector-icons';

const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(0)}jt`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
};

export const DashboardScreen: React.FC = () => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;
  const { user } = useAuthStore();
  const {
    stats,
    tenantGrowth,
    revenueData,
    subscriptionStatus,
    recentActivities,
    isLoading,
    fetchDashboardData,
  } = useDashboardStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      tenant_created: 'business-outline',
      subscription: 'arrow-up-circle-outline',
      payment: 'cash-outline',
      ticket: 'ticket-outline',
      error: 'alert-circle-outline',
    };
    return icons[type] || 'ellipse-outline';
  };

  const getActivityColor = (type: string): string => {
    const activityColors: Record<string, string> = {
      tenant_created: theme.success,
      subscription: theme.primary,
      payment: theme.success,
      ticket: theme.warning,
      error: theme.error,
    };
    return activityColors[type] || theme.textSecondary;
  };

  if (isLoading && !stats) {
    return <Loading fullScreen message="Memuat data dashboard..." />;
  }

  // Prepare chart data
  const tenantChartData = tenantGrowth.map((item) => ({
    label: item.month,
    value: item.newTenants,
    value2: item.churnedTenants,
  }));

  const revenueChartData = revenueData.map((item) => ({
    label: item.month,
    value: item.revenue,
    value2: item.target,
  }));

  const subscriptionChartData = subscriptionStatus
    ? [
        { label: 'Active', value: subscriptionStatus.active, color: theme.success },
        { label: 'Trial', value: subscriptionStatus.trial, color: theme.warning },
        { label: 'Expired', value: subscriptionStatus.expired, color: theme.error },
        { label: 'Cancelled', value: subscriptionStatus.cancelled, color: theme.textDisabled },
      ]
    : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Selamat Datang,</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Admin'}</Text>
          </View>
          <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Tenants"
            value={stats?.totalTenants || 0}
            subtitle={`${stats?.activeTenants || 0} aktif`}
            icon="business-outline"
            iconColor={theme.primary}
            trend={{ value: '+12%', isPositive: true }}
          />
          <StatCard
            title="Revenue Bulan Ini"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            subtitle={`Total: ${formatCurrency(stats?.totalRevenue || 0)}`}
            icon="cash-outline"
            iconColor={theme.success}
          />
          <StatCard
            title="Open Tickets"
            value={stats?.openTickets || 0}
            subtitle="Perlu ditangani"
            icon="ticket-outline"
            iconColor={theme.warning}
          />
          <StatCard
            title="Critical Errors"
            value={stats?.criticalErrors || 0}
            subtitle="Perlu investigasi"
            icon="alert-triangle-outline"
            iconColor={theme.error}
          />
        </View>

        {/* Tenant Growth Chart */}
        <View style={styles.chartSection}>
          <LineChart
            data={tenantChartData}
            title="Pertumbuhan Tenant"
            subtitle="6 Bulan Terakhir"
            color={theme.primary}
            color2={theme.error}
            legend1="Tenant Baru"
            legend2="Churned"
            height={220}
          />
        </View>

        {/* Subscription Status */}
        <View style={styles.chartSection}>
          <DonutChart
            data={subscriptionChartData}
            title="Status Subscription"
            centerLabel="Total"
            centerValue={subscriptionStatus ? subscriptionStatus.active + subscriptionStatus.trial + subscriptionStatus.expired + subscriptionStatus.cancelled : 0}
            size={140}
          />
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartSection}>
          <BarChart
            data={revenueChartData}
            title="Revenue vs Target"
            subtitle="2024"
            color={theme.success}
            color2={theme.info}
            legend1="Revenue"
            legend2="Target"
            height={220}
          />
        </View>

        {/* Recent Activities */}
        <Card title="Aktivitas Terbaru" icon="time-outline" style={styles.activitiesCard}>
          {recentActivities.slice(0, 5).map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIconContainer,
                  { backgroundColor: getActivityColor(activity.type) + '20' },
                ]}
              >
                <Ionicons
                  name={getActivityIcon(activity.type)}
                  size={18}
                  color={getActivityColor(activity.type)}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
                <Text style={[styles.activityDescription, { color: theme.textSecondary }]}>
                  {activity.description}
                </Text>
              </View>
              <Text style={[styles.activityTime, { color: theme.textDisabled }]}>
                {formatTime(activity.timestamp)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Plan Distribution */}
        {subscriptionStatus?.byPlan && (
          <Card title="Distribusi Plan" icon="pie-chart-outline" style={styles.planCard}>
            {subscriptionStatus.byPlan.map((plan, index) => (
              <View key={index} style={styles.planItem}>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: theme.text }]}>{plan.planName}</Text>
                  <Text style={[styles.planCount, { color: theme.textSecondary }]}>
                    {plan.count} subscriber
                  </Text>
                </View>
                <View style={styles.planBarContainer}>
                  <View
                    style={[
                      styles.planBar,
                      { width: `${plan.percentage}%`, backgroundColor: theme.primary },
                    ]}
                  />
                </View>
                <Text style={[styles.planPercentage, { color: theme.text }]}>{plan.percentage}%</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  chartSection: {
    marginBottom: spacing.md,
  },
  activitiesCard: {
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  planInfo: {
    width: 100,
  },
  planName: {
    fontSize: 13,
    fontWeight: '500',
  },
  planCount: {
    fontSize: 11,
  },
  planBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  planBar: {
    height: '100%',
    borderRadius: 4,
  },
  planPercentage: {
    width: 40,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
});
