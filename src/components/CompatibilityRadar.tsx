// Octagonal radar chart — 8 compatibility dimensions × score (0..1).
// Demo wow-factor for the CompatibilityReport screen.

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { DIMENSIONS, DIMENSION_LABELS, type Dimension, type StoredReport } from '../api/types';

type Props = {
  scores: StoredReport['dimension_scores'];
  size?: number;
};

// Polar → Cartesian helper. The 8 dimensions march clockwise from 12 o'clock.
function polarToXY(
  cx: number,
  cy: number,
  radius: number,
  indexOfEight: number
): { x: number; y: number } {
  // -PI/2 puts index 0 at the top; clockwise advances by 2π/8.
  const angle = -Math.PI / 2 + (indexOfEight * 2 * Math.PI) / 8;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function polygonPath(
  cx: number,
  cy: number,
  radius: number
): string {
  return DIMENSIONS.map((_, i) => {
    const { x, y } = polarToXY(cx, cy, radius, i);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function scoredPolygonPath(
  cx: number,
  cy: number,
  maxRadius: number,
  scores: StoredReport['dimension_scores']
): string {
  return DIMENSIONS.map((d, i) => {
    const row = scores[d];
    const r = row ? maxRadius * Math.max(0.05, row.score) : maxRadius * 0.05;
    const { x, y } = polarToXY(cx, cy, r, i);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export const CompatibilityRadar = ({ scores, size = 280 }: Props) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 38;
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Concentric octagon rings */}
        {rings.map((r) => (
          <Polygon
            key={r}
            points={polygonPath(cx, cy, maxRadius * r)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        {/* Radial spokes */}
        {DIMENSIONS.map((_, i) => {
          const { x, y } = polarToXY(cx, cy, maxRadius, i);
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          );
        })}

        {/* Scored polygon */}
        <Polygon
          points={scoredPolygonPath(cx, cy, maxRadius, scores)}
          fill="#06b6d4"
          fillOpacity={0.18}
          stroke="#0e7490"
          strokeWidth={2}
        />

        {/* Score dots on each vertex */}
        {DIMENSIONS.map((d, i) => {
          const row = scores[d];
          const r = row ? maxRadius * Math.max(0.05, row.score) : maxRadius * 0.05;
          const { x, y } = polarToXY(cx, cy, r, i);
          const dotColor =
            row && row.score >= 0.75
              ? '#10b981'
              : row && row.score >= 0.55
                ? '#f59e0b'
                : '#ef4444';
          return (
            <Circle key={d} cx={x} cy={y} r={4} fill={dotColor} />
          );
        })}

        {/* Dimension labels at outer vertices */}
        {DIMENSIONS.map((d, i) => {
          // Push the label slightly past the polygon vertex.
          const labelR = maxRadius + 22;
          const { x, y } = polarToXY(cx, cy, labelR, i);
          // Anchor based on quadrant so labels don't overflow.
          const anchor =
            Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end';
          return (
            <G key={d}>
              <SvgText
                x={x}
                y={y + 4}
                fontSize={10}
                fontWeight="700"
                fill="#0f172a"
                textAnchor={anchor}
              >
                {DIMENSION_LABELS[d].toUpperCase()}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 8,
        }}
      >
        <LegendDot color="#10b981" label="Strong (75%+)" />
        <LegendDot color="#f59e0b" label="Mid (55-74%)" />
        <LegendDot color="#ef4444" label="Friction (<55%)" />
      </View>
    </View>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        marginRight: 4,
      }}
    />
    <Text style={{ color: '#475569', fontSize: 9, fontWeight: '700' }}>
      {label}
    </Text>
  </View>
);
