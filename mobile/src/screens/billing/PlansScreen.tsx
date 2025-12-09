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
import { billingService, Plan } from '../../services/billing';
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

export const PlansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPlans = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await billingService.getPlans({
        page: pageNum,
        perPage: 20,
        search: searchQuery,
      });
      setPlans(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans(page, search);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPlans(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlans(page, search);
    setRefreshing(false);
  }, [page, search]);

  const renderItem = ({ item }: { item: Plan }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg }]}
      onPress={() => navigation.navigate('PlanDetail', { planId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="ribbon-outline" size={24} color={theme.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.price, { color: theme.primary }]}>
            {formatCurrency(item.price)}/{item.interval}
          </Text>
        </View>
        <Chip
          label={item.isActive ? 'Aktif' : 'Tidak Aktif'}
          color={item.isActive ? 'success' : 'secondary'}
          size="sm"
        />
      </View>
      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {item.description || 'Tidak ada deskripsi'}
      </Text>
      {item.features && item.features.length > 0 && (
        <View style={styles.features}>
          {item.features.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={theme.success} />
              <Text style={[styles.featureText, { color: theme.textSecondary }]}>{feature}</Text>
            </View>
          ))}
          {item.features.length > 3 && (
            <Text style={[styles.moreFeatures, { color: theme.primary }]}>
              +{item.features.length - 3} fitur lainnya
            </Text>
          )}
        </View>
      )}
      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {item.subscribersCount || 0} subscriber
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Plans</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('PlanForm', { mode: 'create' })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Cari plan..." />

      {loading && !refreshing ? (
        <Loading message="Memuat data plans..." />
      ) : plans.length === 0 ? (
        <EmptyState
          icon="ribbon-outline"
          title="Tidak ada plan"
          message="Belum ada plan yang terdaftar"
        />
      ) : (
        <FlatList
          data={plans}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  price: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  description: { fontSize: 13, marginTop: spacing.md, lineHeight: 18 },
  features: { marginTop: spacing.md },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  featureText: { fontSize: 12, marginLeft: 6 },
  moreFeatures: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, marginLeft: 6 },
});
