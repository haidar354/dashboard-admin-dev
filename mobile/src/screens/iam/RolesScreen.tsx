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
import { iamService, Role, PaginationMeta } from '../../services/iam';
import { SearchBar, Chip, Loading, EmptyState } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/Modal';

export const RolesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; roleId: string | null }>({
    visible: false,
    roleId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await iamService.getRoles({
        page: pageNum,
        perPage: 20,
        search: searchQuery,
      });
      setRoles(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching roles:', error);
      Alert.alert('Error', 'Gagal memuat data roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles(page, search);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRoles(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRoles(page, search);
    setRefreshing(false);
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteDialog.roleId) return;
    setDeleting(true);
    try {
      await iamService.deleteRole(deleteDialog.roleId);
      setDeleteDialog({ visible: false, roleId: null });
      Alert.alert('Sukses', 'Role berhasil dihapus');
      fetchRoles(page, search);
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus role');
    } finally {
      setDeleting(false);
    }
  };

  const renderRoleItem = ({ item }: { item: Role }) => (
    <TouchableOpacity
      style={[styles.roleCard, { backgroundColor: theme.cardBg }]}
      onPress={() => navigation.navigate('RoleDetail', { roleId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.roleHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.primary} />
        </View>
        <View style={styles.roleInfo}>
          <Text style={[styles.roleName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.roleDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description || 'Tidak ada deskripsi'}
          </Text>
        </View>
      </View>
      <View style={styles.roleStats}>
        <View style={styles.statItem}>
          <Ionicons name="key-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {item.permissionsCount || 0} Permissions
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {item.usersCount || 0} Users
          </Text>
        </View>
      </View>
      <View style={styles.roleFooter}>
        <Text style={[styles.dateText, { color: theme.textDisabled }]}>
          Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.warning + '20' }]}
            onPress={() => navigation.navigate('RoleForm', { roleId: item.id, mode: 'edit' })}
          >
            <Ionicons name="create-outline" size={18} color={theme.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
            onPress={() => setDeleteDialog({ visible: true, roleId: item.id })}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Roles</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('RoleForm', { mode: 'create' })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Cari role..."
      />

      {/* List */}
      {loading && !refreshing ? (
        <Loading message="Memuat data roles..." />
      ) : roles.length === 0 ? (
        <EmptyState
          icon="shield-outline"
          title="Tidak ada role"
          message="Belum ada role yang terdaftar"
          actionLabel="Tambah Role"
          onAction={() => navigation.navigate('RoleForm', { mode: 'create' })}
        />
      ) : (
        <FlatList
          data={roles}
          renderItem={renderRoleItem}
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

      {/* Delete Dialog */}
      <ConfirmDialog
        visible={deleteDialog.visible}
        onClose={() => setDeleteDialog({ visible: false, roleId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus role ini?"
        confirmLabel="Hapus"
        confirmVariant="danger"
        loading={deleting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  roleCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  roleStats: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    marginLeft: 6,
  },
  roleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
