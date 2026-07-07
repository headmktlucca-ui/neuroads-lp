'use client';

import React, { useEffect, useRef } from 'react';

export default function HeroCircuitBackground({ id = 'circuit' }: { id?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx = rawCtx as CanvasRenderingContext2D;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ORANGE = '255,106,0';
    const AMBER  = '255,158,61';
    const GRAY   = '155,166,182';

    let seed = 21;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const rint = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));

    interface Trace {
      pts: [number, number][];
      cum: number[];
      total: number;
      energy: number;
    }

    interface Pulse {
      trace: Trace;
      dist: number;
      speed: number;
      tail: number;
    }

    let W = 0;
    let H = 0;
    let dpr = 1;
    let traces: Trace[] = [];
    const pulses: Pulse[] = [];

    const TURNS: Record<string, [number, number][]> = {
      '1,0': [[1, 1], [1, -1]],
      '0,1': [[1, 1], [-1, 1]],
      '1,1': [[1, 0], [0, 1]],
      '1,-1': [[1, 0], [0, -1]],
      '-1,1': [[0, 1], [-1, 0]],
      '0,-1': [[1, -1], [-1, -1]],
      '-1,0': [[-1, 1], [-1, -1]],
      '-1,-1': [[-1, 0], [0, -1]]
    };

    function buildTraces() {
      seed = 21;
      traces = [];
      const grid = Math.max(48, Math.round(W / 40));
      const n = W < 700 ? 26 : 46;
      const dirs = Object.keys(TURNS).map(k => k.split(',').map(Number) as [number, number]);

      for (let k = 0; k < n; k++) {
        const x = rint(Math.floor((W * 0.30) / grid), Math.floor(W / grid)) * grid;
        const y = rint(0, Math.floor(H / grid)) * grid;
        const pts: [number, number][] = [[x, y]];
        let dir = dirs[rint(0, dirs.length - 1)];
        const segs = rint(4, 8);
        for (let s = 0; s < segs; s++) {
          const seg = rint(2, 5) * grid;
          const last = pts[pts.length - 1];
          pts.push([last[0] + dir[0] * seg, last[1] + dir[1] * seg]);
          const opts = TURNS[dir.join(',')];
          dir = opts[rint(0, opts.length - 1)];
        }
        const cum = [0];
        for (let i = 1; i < pts.length; i++) {
          cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        }
        traces.push({ pts, cum, total: cum[cum.length - 1], energy: 0 });
      }
    }

    function pointAt(tr: Trace, dist: number): [number, number] {
      const { pts, cum } = tr;
      for (let i = 1; i < cum.length; i++) {
        if (dist <= cum[i]) {
          const t = (dist - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
          return [
            pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
            pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t
          ];
        }
      }
      return pts[pts.length - 1];
    }

    function spawnPulse() {
      if (traces.length === 0) return;
      const idx = rint(0, traces.length - 1);
      pulses.push({
        trace: traces[idx],
        dist: 0,
        speed: 55 + rnd() * 45,
        tail: 140 + rnd() * 120
      });
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const tr of traces) {
        ctx.beginPath();
        tr.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        const e = tr.energy;
        ctx.strokeStyle = `rgba(${GRAY},${0.20 + e * 0.10})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        for (const p of [tr.pts[0], tr.pts[tr.pts.length - 1]]) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${GRAY},${0.30 + e * 0.25})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }
    }

    function drawPulses(dt: number) {
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.dist += p.speed * dt;
        p.trace.energy = Math.min(1, p.trace.energy + dt * 0.8);
        if (p.dist - p.tail > p.trace.total) {
          pulses.splice(i, 1);
          continue;
        }

        const STEPS = 14;
        for (let s = 0; s < STEPS; s++) {
          const d1 = Math.min(p.trace.total, Math.max(0, p.dist - (s + 1) * (p.tail / STEPS)));
          const d2 = Math.min(p.trace.total, Math.max(0, p.dist - s * (p.tail / STEPS)));
          if (d2 <= d1) continue;
          const a = 0.55 * (1 - s / STEPS);
          const [x1, y1] = pointAt(p.trace, d1);
          const [x2, y2] = pointAt(p.trace, d2);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${ORANGE},${a})`;
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
        if (p.dist <= p.trace.total) {
          const [hx, hy] = pointAt(p.trace, p.dist);
          const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26);
          g.addColorStop(0, `rgba(${AMBER},.85)`);
          g.addColorStop(0.35, `rgba(${ORANGE},.4)`);
          g.addColorStop(1, `rgba(${ORANGE},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(hx, hy, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,.95)`;
          ctx.beginPath();
          ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (const tr of traces) tr.energy = Math.max(0, tr.energy - dt * 0.25);
    }

    let last = 0;
    let spawnTimer = 0;
    let animationFrameId: number;

    function frame(t: number) {
      if (!last) last = t;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      spawnTimer -= dt;
      if (spawnTimer <= 0 && pulses.length < 6) {
        spawnPulse();
        spawnTimer = 1.4 + rnd() * 2.2;
      }
      drawStatic();
      drawPulses(dt);
      animationFrameId = requestAnimationFrame(frame);
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildTraces();
      if (reduced) {
        for (let i = 0; i < 5; i++) {
          if (traces.length > 0) {
            const idx = rint(0, traces.length - 1);
            traces[idx].energy = 1;
          }
        }
        drawStatic();
      }
    }

    window.addEventListener('resize', resize);
    resize();
    if (!reduced) {
      animationFrameId = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-[1] overflow-hidden">
      {/* Camada 1 — Canvas (trilhas + pulsos) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        id={id}
      />
      {/* Camada 2 — Reflexos de vidro (CSS) */}
      <div className="glass z-[2]" />
      {/* Camada 3 — Vinheta de contraste (CSS, estática) */}
      <div className="veil z-[3]" />
    </div>
  );
}
