'use client';

import { motion } from 'framer-motion';

type SparklineProps = {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
  fillOpacity?: number;
};

export default function Sparkline({
  points,
  color = '#22d3ee',
  width = 120,
  height = 36,
  fillOpacity = 0.18,
}: SparklineProps) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height * 0.8 - height * 0.1;
    return { x, y };
  });

  const path = coords
    .map((c, i) => (i === 0 ? `M ${c.x},${c.y}` : `L ${c.x},${c.y}`))
    .join(' ');

  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;
  const gradId = `spark-grad-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <motion.circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r={3}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}
