'use client';

import React from 'react';
import { motion } from 'framer-motion';

type HubCardProps = {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  /** Use false to render a plain div (no animation) */
  animated?: boolean;
  style?: React.CSSProperties;
};

/**
 * Standard neumorphic card for all Hub pages.
 * Applies consistent shadow, background, border and left accent.
 */
export default function HubCard({
  children,
  className = '',
  accentColor = '#FF6A00',
  animated = true,
  style,
}: HubCardProps) {
  const base =
    'rounded-2xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]';

  const inlineStyle: React.CSSProperties = {
    borderLeft: `3px solid ${accentColor}`,
    ...style,
  };

  if (!animated) {
    return (
      <div className={`${base} ${className}`} style={inlineStyle}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`${base} ${className}`}
      style={inlineStyle}
    >
      {children}
    </motion.div>
  );
}
