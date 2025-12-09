import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Text as SvgText, Circle } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  title?: string;
  subtitle?: string;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  size = 160,
  strokeWidth = 24,
  showLegend = true,
  centerLabel,
  centerValue,
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
        {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
        <View style={[styles.empty, { height: size }]}>
          <Text style={{ color: theme.textDisabled }}>Data tidak tersedia</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  let cumulativeAngle = -90; // Start from top

  const arcs = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    return (
      <Path
        key={index}
        d={pathD}
        stroke={item.color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.chartContainer}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius}
              stroke={theme.divider}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Data arcs */}
            {arcs}
          </Svg>
          {(centerLabel || centerValue) && (
            <View style={[styles.centerContent, { width: size, height: size }]}>
              {centerValue !== undefined && (
                <Text style={[styles.centerValue, { color: theme.text }]}>{centerValue}</Text>
              )}
              {centerLabel && (
                <Text style={[styles.centerLabel, { color: theme.textSecondary }]}>{centerLabel}</Text>
              )}
            </View>
          )}
        </View>
        {showLegend && (
          <View style={styles.legendContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.legendValue, { color: theme.text }]}>
                    {item.value} ({Math.round((item.value / total) * 100)}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  centerLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
