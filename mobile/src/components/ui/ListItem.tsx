import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  avatar?: string;
  avatarText?: string;
  onPress?: () => void;
  style?: ViewStyle;
  showDivider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor,
  rightIcon = 'chevron-forward',
  rightElement,
  avatar,
  avatarText,
  onPress,
  style,
  showDivider = true,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const content = (
    <View style={[styles.container, style]}>
      {(leftIcon || avatarText) && (
        <View
          style={[
            styles.leftContainer,
            {
              backgroundColor: (leftIconColor || theme.primary) + '20',
            },
          ]}
        >
          {leftIcon ? (
            <Ionicons name={leftIcon} size={22} color={leftIconColor || theme.primary} />
          ) : (
            <Text style={[styles.avatarText, { color: leftIconColor || theme.primary }]}>
              {avatarText?.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text style={[styles.description, { color: theme.textDisabled }]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
      {rightElement || (
        onPress && (
          <Ionicons name={rightIcon} size={20} color={theme.textSecondary} />
        )
      )}
    </View>
  );

  const wrapper = (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
      {showDivider && <View style={[styles.divider, { backgroundColor: theme.divider }]} />}
    </>
  );

  return wrapper;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  leftContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
});
