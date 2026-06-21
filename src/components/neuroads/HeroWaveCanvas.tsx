'use client';

import { useEffect, useRef } from 'react';

export default function HeroWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;
    let lastTs = 0;

    // 14 waves (was 22): same visual density, 36% fewer draw calls
    const WAVE_COUNT = 14;
    const V_CENTER = 0.56;
    const V_SPREAD = 0.50;

    const getParams = (i: number) => {
      const norm = i / (WAVE_COUNT - 1);
      const rel = norm - 0.5;
      const dist = Math.abs(rel * 2);

      const baseY = h * V_CENTER + rel * h * V_SPREAD;
      const amplitude = h * 0.17 * (1 - dist * 0.2);
      const phase = rel * 1.1;
      const brightness = Math.pow(Math.max(0, 1 - dist), 2.2);

      return { baseY, amplitude, phase, brightness };
    };

    const wy = (x: number, amplitude: number, phase: number): number => {
      const k = (2 * Math.PI) / (w * 0.58);
      return amplitude * Math.sin(k * x + phase + t);
    };

    const waveColor = (brightness: number) => {
      const r = Math.round(255 * brightness + 35 * (1 - brightness));
      const g = Math.round(110 * brightness * brightness + 18 * (1 - brightness));
      const b = Math.round(3 * brightness);
      return { r, g, b };
    };

    const draw = (timestamp: number) => {
      rafRef.current = requestAnimationFrame(draw);

      // Throttle to 30fps — halves GPU load vs 60fps
      const dt = timestamp - lastTs;
      if (dt < 30) return;
      lastTs = timestamp;

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.lineWidth = 0.6;
      const gs = 42;
      for (let x = 0; x < w; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // STEP 5 (was 3): 40% fewer path points per wave
      const STEP = 5;

      for (let i = 0; i < WAVE_COUNT; i++) {
        const { baseY, amplitude, phase, brightness } = getParams(i);
        if (brightness < 0.08) continue;

        const { r, g, b } = waveColor(brightness);

        const path = new Path2D();
        for (let x = 0; x <= w; x += STEP) {
          const y = baseY + wy(x, amplitude, phase);
          if (x === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }

        // Soft ambient glow — wide stroke at very low alpha.
        // Replaces ctx.shadowBlur which forces CPU rasterization.
        // Wide alpha stroke achieves the same look via GPU compositing.
        if (brightness > 0.2) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${brightness * 0.07})`;
          ctx.lineWidth = 14;
          ctx.stroke(path);
        }

        // Core line
        ctx.strokeStyle = `rgba(${r},${g},${b},${brightness * 0.85 + 0.08})`;
        ctx.lineWidth = 1.3;
        ctx.stroke(path);
      }

      ctx.restore();

      t += 0.006;
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
