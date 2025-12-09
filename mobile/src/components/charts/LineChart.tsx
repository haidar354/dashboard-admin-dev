import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { colors, borderRadius, spacing } from '../../config/theme';

interface LineChartProps {
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

export const LineChart: React.FC<LineChartProps> = ({
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
  const chartColor = color || theme.primary;
  const chartColor2 = color2 || theme.error;
  
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;
  const chartHeight = height - 40;
  const paddingLeft = 40;
  const paddingBottom = 30;

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

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0))) * 1.1;
  const minValue = 0;
  
  const getX = (index: number) => paddingLeft + (index * (chartWidth - paddingLeft)) / (data.length - 1 || 1);
  const getY = (value: number) => chartHeight - paddingBottom - ((value - minValue) / (maxValue - minValue)) * (chartHeight - paddingBottom - 10);

  // Create path for line 1
  const path1 = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Create path for line 2
  const path2 = data[0].value2 !== undefined ? data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value2 || 0);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ') : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      )}
      {showLegend && data[0].value2 !== undefined && (
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
            y1={10 + (chartHeight - paddingBottom - 10) * ratio}
            x2={chartWidth}
            y2={10 + (chartHeight - paddingBottom - 10) * ratio}
            stroke={theme.divider}
            strokeWidth={1}
          />
        ))}
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => (
          <SvgText
            key={i}
            x={paddingLeft - 8}
            y={10 + (chartHeight - paddingBottom - 10) * ratio + 4}
            fontSize={10}
            fill={theme.textSecondary}
            textAnchor="end"
          >
            {Math.round(maxValue - maxValue * ratio)}
          </SvgText>
        ))}
        {/* Line 1 */}
        <Path d={path1} stroke={chartColor} strokeWidth={2} fill="none" />
        {/* Line 2 */}
        {path2 && <Path d={path2} stroke={chartColor2} strokeWidth={2} fill="none" />}
        {/* Points for line 1 */}
        {data.map((point, index) => (
          <Circle
            key={index}
            cx={getX(index)}
            cy={getY(point.value)}
            r={4}
            fill={chartColor}
          />
        ))}
        {/* X-axis labels */}
        {data.map((point, index) => (
          <SvgText
            key={index}
            x={getX(index)}
            y={chartHeight - 8}
            fontSize={10}
            fill={theme.textSecondary}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        ))}
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
