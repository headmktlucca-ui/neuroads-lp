'use client';

import { animate, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  compact?: boolean;
};

export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.6,
  compact = false,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (compact) {
      if (latest >= 1_000_000) return `${prefix}${(latest / 1_000_000).toFixed(2)}M${suffix}`;
      if (latest >= 1_000) return `${prefix}${(latest / 1_000).toFixed(1)}k${suffix}`;
      return `${prefix}${latest.toFixed(decimals)}${suffix}`;
    }
    return `${prefix}${latest.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [count, duration, inView, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
