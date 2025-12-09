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
import { iamService, User, PaginationMeta } from '../../services/iam';
import { SearchBar, Card, Chip, Loading, EmptyState, Button } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/Modal';

export const UsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; userId: string | null }>({
    visible: false,
    userId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await iamService.getUsers({
        page: pageNum,
        perPage: 20,
        search: searchQuery,
      });
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers(page, search);
    setRefreshing(false);
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;
    setDeleting(true);
    try {
      await iamService.deleteUser(deleteDialog.userId);
      setDeleteDialog({ visible: false, userId: null });
      Alert.alert('Sukses', 'User berhasil dihapus');
      fetchUsers(page, search);
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus user');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'suspended':
      case 'blocked':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'suspended':
        return 'Suspended';
      case 'blocked':
        return 'Diblokir';
      default:
        return status;
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: theme.cardBg }]}
      onPress={() => navigation.navigate('UserDetail', { userId: item.userId })}
      activeOpacity={0.7}
    >
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
          {item.avatar ? (
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
          {item.phone && (
            <Text style={[styles.userPhone, { color: theme.textDisabled }]}>{item.phone}</Text>
          )}
        </View>
        <Chip
          label={getStatusText(item.status)}
          color={getStatusColor(item.status) as any}
          size="sm"
        />
      </View>
      <View style={styles.userFooter}>
        <View style={styles.userMeta}>
          <Ionicons name="mail-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {item.emailVerifiedAt ? 'Terverifikasi' : 'Belum Verifikasi'}
          </Text>
        </View>
        <View style={styles.userMeta}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {item.lastLoginAt
              ? new Date(item.lastLoginAt).toLocaleDateString('id-ID')
              : 'Belum login'}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.info + '20' }]}
            onPress={() => navigation.navigate('UserDetail', { userId: item.userId })}
          >
            <Ionicons name="eye-outline" size={18} color={theme.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.warning + '20' }]}
            onPress={() => navigation.navigate('UserForm', { userId: item.userId, mode: 'edit' })}
          >
            <Ionicons name="create-outline" size={18} color={theme.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
            onPress={() => setDeleteDialog({ visible: true, userId: item.userId })}
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Platform Users</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('UserForm', { mode: 'create' })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Cari berdasarkan nama..."
      />

      {/* List */}
      {loading && !refreshing ? (
        <Loading message="Memuat data users..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Tidak ada user"
          message="Belum ada user yang terdaftar atau hasil pencarian kosong"
          actionLabel="Tambah User"
          onAction={() => navigation.navigate('UserForm', { mode: 'create' })}
        />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.userId}
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
        onClose={() => setDeleteDialog({ visible: false, userId: null })}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus user ini?"
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
  userCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 'auto',
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
