'use client';

import React, { useEffect, useRef } from 'react';

export default function HeroSilkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W: number, H: number, dpr: number;
    let ribbons: Array<{
      n: number;
      cy: number;
      amp: number;
      hot: boolean;
      lines: Array<{
        off: number;
        f1: number;
        f2: number;
        p1: number;
        p2: number;
        sp: number;
      }>;
    }> = [];

    function build() {
      ribbons = [];
      const mobile = W < 700;
      const configs = [
        { n: mobile ? 14 : 22, cy: 0.46, amp: 0.16, hot: false },
        { n: mobile ? 10 : 16, cy: 0.58, amp: 0.12, hot: false },
        { n: mobile ? 8 : 12, cy: 0.52, amp: 0.14, hot: true },
      ];

      let s = 0;
      for (const cfg of configs) {
        const lines = [];
        for (let i = 0; i < cfg.n; i++) {
          s++;
          lines.push({
            off: i / (cfg.n - 1),
            f1: 0.9 + Math.sin(s * 7.3) * 0.18,
            f2: 1.7 + Math.cos(s * 3.1) * 0.25,
            p1: s * 1.7,
            p2: s * 0.9,
            sp: 0.1 + (Math.sin(s * 5.7) * 0.5 + 0.5) * 0.08,
          });
        }
        ribbons.push({ ...cfg, lines });
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      ctx!.lineCap = 'round';

      const startX = W * 0.25;
      const steps = 90;

      for (const rb of ribbons) {
        const spread = H * 0.1;

        for (const ln of rb.lines) {
          ctx!.beginPath();

          for (let k = 0; k <= steps; k++) {
            const u = k / steps;
            const x = startX + u * (W - startX + 80);
            const env = Math.sin(u * Math.PI);

            const wave =
              Math.sin(u * Math.PI * 2 * ln.f1 + t * ln.sp + ln.p1) * rb.amp * H * 0.55 +
              Math.sin(u * Math.PI * 2 * ln.f2 - t * ln.sp * 0.7 + ln.p2) * rb.amp * H * 0.3;

            const y =
              H * rb.cy + wave * env + (ln.off - 0.5) * spread * (0.4 + env * 0.6);

            k ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y);
          }

          if (rb.hot) {
            const g = ctx!.createLinearGradient(startX, 0, W, 0);
            g.addColorStop(0, 'rgba(255,106,0,0)');
            g.addColorStop(0.35, 'rgba(255,106,0,.34)');
            g.addColorStop(0.6, 'rgba(255,158,61,.44)');
            g.addColorStop(1, 'rgba(255,106,0,.08)');
            ctx!.strokeStyle = g;
            ctx!.lineWidth = 1.4;
          } else {
            const a = 0.1 + Math.abs(ln.off - 0.5) * -0.06 + 0.08;
            ctx!.strokeStyle = `rgba(150,162,178,${Math.max(0.07, a)})`;
            ctx!.lineWidth = 1.1;
          }

          ctx!.stroke();
        }
      }

      // Signal nodes (4 dots sliding on orange ribbon)
      const hot = ribbons[2];
      if (hot) {
        for (let i = 0; i < 4; i++) {
          const u = (t * 0.028 + i * 0.25) % 1;
          const ln = hot.lines[Math.floor(hot.lines.length / 2)];

          const env = Math.sin(u * Math.PI);
          const wave =
            Math.sin(u * Math.PI * 2 * ln.f1 + t * ln.sp + ln.p1) * hot.amp * H * 0.55 +
            Math.sin(u * Math.PI * 2 * ln.f2 - t * ln.sp * 0.7 + ln.p2) * hot.amp * H * 0.3;

          const x = startX + u * (W - startX + 80);
          const y = H * hot.cy + wave * env;

          // Glow
          const g = ctx!.createRadialGradient(x, y, 0, x, y, 20);
          g.addColorStop(0, 'rgba(255,158,61,.8)');
          g.addColorStop(0.4, 'rgba(255,106,0,.32)');
          g.addColorStop(1, 'rgba(255,106,0,0)');
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(x, y, 20, 0, Math.PI * 2);
          ctx!.fill();

          // Core
          ctx!.fillStyle = 'rgba(255,255,255,.95)';
          ctx!.beginPath();
          ctx!.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    let raf: number;

    function frame(ms: number) {
      draw(ms / 1000);
      raf = requestAnimationFrame(frame);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas!.clientWidth;
      H = canvas!.clientHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();

      if (reduced) {
        draw(12);
      }
    }

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);
    resize();

    if (!reduced) {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Layer 1: Halo (static glow) */}
      <div
        className="halo absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(46% 60% at 74% 52%, rgba(255,158,61,.14) 0%, rgba(255,106,0,.05) 45%, transparent 70%)',
        }}
      >
        <style>{`
          @media (max-width:640px) {
            .halo {
              background: radial-gradient(70% 45% at 50% 78%, rgba(255,158,61,.14) 0%, rgba(255,106,0,.05) 45%, transparent 70%) !important;
            }
          }
        `}</style>
      </div>

      {/* Layer 2: Canvas (silk ribbons + signal nodes) */}
      <canvas
        ref={canvasRef}
        id="silk"
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Layer 3: Veil (contrast vignette) */}
      <div
        className="veil absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(250,251,253,.85) 0%, rgba(250,251,253,.4) 36%, transparent 58%)',
        }}
      >
        <style>{`
          @media (max-width:640px) {
            .veil {
              background: linear-gradient(180deg, rgba(250,251,253,.8) 0%, rgba(250,251,253,.35) 55%, transparent 80%) !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
