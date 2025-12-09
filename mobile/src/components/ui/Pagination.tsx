import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems = 0,
  itemsPerPage = 20,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <View style={styles.container}>
      {showInfo && totalItems > 0 && (
        <Text style={[styles.info, { color: theme.textSecondary }]}>
          {from}-{to} dari {totalItems}
        </Text>
      )}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.surfaceVariant },
            !canGoPrev && styles.buttonDisabled,
          ]}
          onPress={() => canGoPrev && onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={canGoPrev ? theme.text : theme.textDisabled}
          />
        </TouchableOpacity>
        <View style={[styles.pageIndicator, { backgroundColor: theme.primary }]}>
          <Text style={styles.pageText}>{currentPage}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.surfaceVariant },
            !canGoNext && styles.buttonDisabled,
          ]}
          onPress={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={canGoNext ? theme.text : theme.textDisabled}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  info: {
    fontSize: 13,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    minWidth: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  pageText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
