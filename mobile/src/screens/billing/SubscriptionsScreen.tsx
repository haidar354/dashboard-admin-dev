import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { colors, spacing, borderRadius } from '../../config/theme';
import { billingService, Subscription } from '../../services/billing';
import { PaginationMeta } from '../../services/iam';
import { SearchBar, Chip, Loading, EmptyState } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export const SubscriptionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchSubscriptions = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await billingService.getSubscriptions({
        page: pageNum,
        perPage: 20,
        search: searchQuery,
      });
      setSubscriptions(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions(page, search);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSubscriptions(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubscriptions(page, search);
    setRefreshing(false);
  }, [page, search]);

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'warning';
      case 'expired': case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'trial': return 'Trial';
      case 'expired': return 'Expired';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg }]}
      onPress={() => navigation.navigate('SubscriptionDetail', { subscriptionId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
          <Ionicons name="receipt-outline" size={24} color={theme.success} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.tenantName}</Text>
          <Text style={[styles.plan, { color: theme.primary }]}>{item.planName}</Text>
        </View>
        <Chip label={getStatusText(item.status)} color={getStatusColor(item.status)} size="sm" />
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {formatCurrency(item.price)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {new Date(item.startDate).toLocaleDateString('id-ID')} - {new Date(item.endDate).toLocaleDateString('id-ID')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Subscriptions</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Cari subscription..." />

      {loading && !refreshing ? (
        <Loading message="Memuat data subscriptions..." />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="Tidak ada subscription"
          message="Belum ada subscription yang terdaftar"
        />
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListFooterComponent={
            meta && meta.lastPage > 1 ? (
              <Pagination
                currentPage={page}
                totalPages={meta.lastPage}
                totalItems={meta.total}
                itemsPerPage={meta.perPage}
                onPageChange={setPage}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  listContent: { padding: spacing.md },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  plan: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  details: { marginTop: spacing.md, gap: spacing.sm },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, marginLeft: 6 },
});
