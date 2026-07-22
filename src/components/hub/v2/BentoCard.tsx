'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';

type BentoCardProps = {
  className?: string;
  children: ReactNode;
  glowColor?: string;
  accentColor?: string;
  delay?: number;
  variant?: 'glass' | 'neumorphic';
  hideLeftBorder?: boolean;
};

export default function BentoCard({
  className = '',
  children,
  glowColor,
  accentColor = '#ff6a00',
  delay = 0,
  variant = 'glass',
  hideLeftBorder = false,
}: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function onMouseLeave() {
    mouseX.set(-200);
    mouseY.set(-200);
  }

  // Soft glow default for each variant
  const finalGlowColor = glowColor || (variant === 'neumorphic' ? 'rgba(255, 106, 0, 0.05)' : 'rgba(255, 106, 0, 0.15)');
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, ${finalGlowColor}, transparent 70%)`;

  const isNeumorphic = variant === 'neumorphic';

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-3xl ${
        isNeumorphic
          ? 'bg-white border border-slate-200/50'
          : 'border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl'
      } ${className}`}
      style={{
        boxShadow: isNeumorphic
          ? '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff'
          : `0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -28px ${finalGlowColor}`,
        ...(isNeumorphic && !hideLeftBorder && { borderLeft: `3px solid ${accentColor}` }),
      }}
    >
      {/* Spotlight glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      
      {/* Conic hover border (only for glass mode) */}
      {!isNeumorphic && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${accentColor}30 90deg, transparent 180deg, ${accentColor}30 270deg, transparent 360deg)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}
      
      <div className="relative h-full z-10">{children}</div>
    </motion.div>
  );
}
