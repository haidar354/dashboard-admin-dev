import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  showFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Cari...',
  onFilter,
  showFilter = false,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.surfaceVariant }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textDisabled}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {showFilter && onFilter && (
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.surfaceVariant }]}
          onPress={onFilter}
        >
          <Ionicons name="filter-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
