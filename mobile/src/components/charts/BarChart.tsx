import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

interface BarChartProps {
  data: Array<{ label: string; value: number; value2?: number }>;
  title?: string;
  subtitle?: string;
  color?: string;
  color2?: string;
  height?: number;
  showLegend?: boolean;
  legend1?: string;
  legend2?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  color,
  color2,
  height = 200,
  showLegend = true,
  legend1 = 'Series 1',
  legend2 = 'Series 2',
}) => {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;
  const chartColor = color || theme.success;
  const chartColor2 = color2 || theme.info;

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;
  const chartHeight = height - 40;
  const paddingLeft = 50;
  const paddingBottom = 30;
  const paddingTop = 10;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
        {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
        <View style={[styles.empty, { height }]}>
          <Text style={{ color: theme.textDisabled }}>Data tidak tersedia</Text>
        </View>
      </View>
    );
  }

  const hasSecondValue = data[0].value2 !== undefined;
  const maxValue = Math.max(...data.flatMap(d => [d.value, d.value2 || 0])) * 1.1;
  const barWidth = hasSecondValue ? 12 : 24;
  const groupWidth = (chartWidth - paddingLeft) / data.length;
  const barGap = 4;

  const getBarHeight = (value: number) => {
    return ((value / maxValue) * (chartHeight - paddingBottom - paddingTop));
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      )}
      {showLegend && hasSecondValue && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: chartColor }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>{legend1}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: chartColor2 }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>{legend2}</Text>
          </View>
        </View>
      )}
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={i}
            x1={paddingLeft}
            y1={paddingTop + (chartHeight - paddingBottom - paddingTop) * (1 - ratio)}
            x2={chartWidth}
            y2={paddingTop + (chartHeight - paddingBottom - paddingTop) * (1 - ratio)}
            stroke={theme.divider}
            strokeWidth={1}
          />
        ))}
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => (
          <SvgText
            key={i}
            x={paddingLeft - 8}
            y={paddingTop + (chartHeight - paddingBottom - paddingTop) * (1 - ratio) + 4}
            fontSize={10}
            fill={theme.textSecondary}
            textAnchor="end"
          >
            {formatValue(maxValue * ratio)}
          </SvgText>
        ))}
        {/* Bars */}
        {data.map((item, index) => {
          const groupX = paddingLeft + index * groupWidth + groupWidth / 2;
          const bar1Height = getBarHeight(item.value);
          const bar2Height = hasSecondValue ? getBarHeight(item.value2 || 0) : 0;
          const bar1X = hasSecondValue ? groupX - barWidth - barGap / 2 : groupX - barWidth / 2;
          const bar2X = groupX + barGap / 2;

          return (
            <G key={index}>
              {/* Bar 1 */}
              <Rect
                x={bar1X}
                y={chartHeight - paddingBottom - bar1Height}
                width={barWidth}
                height={bar1Height}
                fill={chartColor}
                rx={4}
              />
              {/* Bar 2 */}
              {hasSecondValue && (
                <Rect
                  x={bar2X}
                  y={chartHeight - paddingBottom - bar2Height}
                  width={barWidth}
                  height={bar2Height}
                  fill={chartColor2}
                  rx={4}
                />
              )}
              {/* X-axis label */}
              <SvgText
                x={groupX}
                y={chartHeight - 8}
                fontSize={10}
                fill={theme.textSecondary}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
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
  legend: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
