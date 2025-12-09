import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { colors, spacing, borderRadius } from '../../config/theme';
import { tenantService, Outlet } from '../../services/tenant';
import { PaginationMeta } from '../../services/iam';
import { SearchBar, Chip, Loading, EmptyState } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/Modal';

export const OutletsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; id: string | null }>({
    visible: false,
    id: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchOutlets = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await tenantService.getOutlets({
        page: pageNum,
        perPage: 20,
        search: searchQuery,
      });
      setOutlets(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching outlets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlets(page, search);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOutlets(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOutlets(page, search);
    setRefreshing(false);
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setDeleting(true);
    try {
      await tenantService.deleteOutlet(deleteDialog.id);
      setDeleteDialog({ visible: false, id: null });
      Alert.alert('Sukses', 'Outlet berhasil dihapus');
      fetchOutlets(page, search);
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus outlet');
    } finally {
      setDeleting(false);
    }
  };

  const renderItem = ({ item }: { item: Outlet }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg }]}
      onPress={() => navigation.navigate('OutletDetail', { outletId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
          <Ionicons name="storefront-outline" size={24} color={theme.success} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.code, { color: theme.textSecondary }]}>Kode: {item.code}</Text>
          <Text style={[styles.businessUnit, { color: theme.info }]}>{item.businessUnitName}</Text>
        </View>
        <Chip
          label={item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
          color={item.status === 'active' ? 'success' : 'secondary'}
          size="sm"
        />
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>{item.phone || '-'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.address || 'Alamat tidak tersedia'}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: theme.textDisabled }]}>
          Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.warning + '20' }]}
            onPress={() => navigation.navigate('OutletForm', { outletId: item.id, mode: 'edit' })}
          >
            <Ionicons name="create-outline" size={18} color={theme.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
            onPress={() => setDeleteDialog({ visible: true, id: item.id })}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Outlets</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('OutletForm', { mode: 'create' })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Cari outlet..." />

      {loading && !refreshing ? (
        <Loading message="Memuat data outlets..." />
      ) : outlets.length === 0 ? (
        <EmptyState
          icon="storefront-outline"
          title="Tidak ada outlet"
          message="Belum ada outlet yang terdaftar"
          actionLabel="Tambah Outlet"
          onAction={() => navigation.navigate('OutletForm', { mode: 'create' })}
        />
      ) : (
        <FlatList
          data={outlets}
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

      <ConfirmDialog
        visible={deleteDialog.visible}
        onClose={() => setDeleteDialog({ visible: false, id: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus outlet ini?"
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={deleting}
      />
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
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
  code: { fontSize: 12, marginTop: 2 },
  businessUnit: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  details: { marginTop: spacing.md, gap: spacing.sm },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, marginLeft: 4, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  date: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: spacing.xs },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
