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
import { supportService, Ticket } from '../../services/support';
import { PaginationMeta } from '../../services/iam';
import { SearchBar, Chip, Loading, EmptyState } from '../../components/ui';
import { Pagination } from '../../components/ui/Pagination';

export const TicketsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchTickets = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await supportService.getTickets({
        page: pageNum,
        perPage: 20,
        search: searchQuery,
      });
      setTickets(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets(page, search);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTickets(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets(page, search);
    setRefreshing(false);
  }, [page, search]);

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'secondary' => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBg }]}
      onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.warning + '20' }]}>
          <Ionicons name="ticket-outline" size={24} color={theme.warning} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.ticketNumber, { color: theme.textSecondary }]}>#{item.ticketNumber}</Text>
          <Text style={[styles.subject, { color: theme.text }]} numberOfLines={2}>{item.subject}</Text>
          <Text style={[styles.tenant, { color: theme.primary }]}>{item.tenantName}</Text>
        </View>
      </View>
      <View style={styles.badges}>
        <Chip label={getStatusText(item.status)} color={getStatusColor(item.status)} size="sm" />
        <Chip label={item.priority.toUpperCase()} color={getPriorityColor(item.priority)} size="sm" />
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: theme.textDisabled }]}>
          {new Date(item.createdAt).toLocaleDateString('id-ID')}
        </Text>
        {item.assignedToName && (
          <View style={styles.assignee}>
            <Ionicons name="person-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.assigneeText, { color: theme.textSecondary }]}>{item.assignedToName}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Support Tickets</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Cari ticket..." showFilter />

      {loading && !refreshing ? (
        <Loading message="Memuat data tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon="ticket-outline"
          title="Tidak ada ticket"
          message="Belum ada ticket yang masuk"
        />
      ) : (
        <FlatList
          data={tickets}
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
  ticketNumber: { fontSize: 12 },
  subject: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  tenant: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  badges: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
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
  assignee: { flexDirection: 'row', alignItems: 'center' },
  assigneeText: { fontSize: 12, marginLeft: 4 },
});
