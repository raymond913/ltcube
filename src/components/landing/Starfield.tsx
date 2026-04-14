"use client";

import { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number;
  color: string;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const colors = ["#ffffff", "#ffffff", "#ffffff", "#c4b5fd", "#93c5fd", "#ffffff"];
    const stars: Star[] = Array.from({ length: 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.8 + 0.4,
      baseOpacity: Math.random() * 0.55 + 0.25,
      twinkleSpeed: Math.random() * 3000 + 2000,
      twinkleOffset: Math.random() * Math.PI * 2,
      layer: Math.floor(Math.random() * 3),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // parallax strength per layer: far=0, mid=1, near=2
    const parallax = [0.003, 0.010, 0.022];

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMouseMove);

    const draw = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const star of stars) {
        const p = parallax[star.layer];
        const px = ((star.x * w + mx * p * w) % w + w) % w;
        const py = ((star.y * h + my * p * h) % h + h) % h;

        const twinkle = Math.sin((time / star.twinkleSpeed) * Math.PI * 2 + star.twinkleOffset);
        const opacity = star.baseOpacity * (0.5 + 0.5 * ((twinkle + 1) / 2));

        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
