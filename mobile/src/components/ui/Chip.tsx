import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

type ChipVariant = 'filled' | 'outlined';
type ChipColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  icon,
  onPress,
  onDelete,
  style,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  const getColor = () => {
    switch (color) {
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'error':
        return theme.error;
      case 'info':
        return theme.info;
      case 'secondary':
        return theme.textSecondary;
      default:
        return theme.primary;
    }
  };

  const chipColor = getColor();

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(variant === 'filled'
      ? { backgroundColor: chipColor + '20' }
      : { backgroundColor: 'transparent', borderWidth: 1, borderColor: chipColor }),
    ...(size === 'sm' ? styles.containerSm : styles.containerMd),
    ...style,
  };

  const textColor = variant === 'filled' ? chipColor : chipColor;

  const content = (
    <>
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 12 : 14}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: textColor }, size === 'sm' && styles.labelSm]}>
        {label}
      </Text>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="close" size={14} color={textColor} />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  containerSm: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  containerMd: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  labelSm: {
    fontSize: 10,
  },
  deleteButton: {
    marginLeft: 4,
  },
});
