/**
 * @fileoverview Starfield background — a parallax field of stars with occasional
 * shooting stars.
 *
 *   - Stars vary in size, boldness, and depth. Closer (bolder/bigger) stars
 *     parallax faster than fainter ones as the page scrolls (vertical via
 *     window.scrollY, horizontal via the optional `offsetRef`), giving depth.
 *   - Stars near the cursor brighten and swell (like the spider canvas nodes).
 *   - Shooting stars streak top-left → bottom-right with slight angle variation,
 *     drawn as fading line trails (the strings-animation look). When the cursor is
 *     near, a capped gravitational pull bends a streak's path slightly — never
 *     fully capturing it.
 *
 * Theme recolors in-place (same pattern as CanvasAnimation / StringsAnimation) —
 * toggling the palette does not restart the animation.
 *
 * Palette matches useCanvasAnimation / useStringsAnimation (--dp-* / --lp-*).
 */
import { useEffect, useRef } from 'react';
import type { ReactElement, RefObject } from 'react';
import './StarfieldAnimation.css';

function getPaletteColors(theme: string): readonly [string, string, string] {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string): string => s.getPropertyValue(v).trim();
  return theme === 'light'
    ? [get('--lp-3'), get('--lp-2'), get('--lp-1')]
    : [get('--dp-3'), get('--dp-4'), get('--dp-5')];
}

interface Star {
  x: number;
  y: number;
  parallax: number;
  radius: number;
  baseAlpha: number;
  colorIndex: number;
  color: string;
}

interface Shoot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  colorIndex: number;
  color: string;
}

const NUM_STARS = 220;
const STAR_PROXIMITY = 130; // px — cursor radius that brightens stars
const SHOOT_ORBIT = 170; // px — cursor radius that bends a shooting star
const SHOOT_PULL = 70; // gravitational constant for the bend
const MAX_TRAIL = 14;

export function StarfieldAnimation({
  theme,
  offsetRef,
}: {
  theme: string;
  /** Horizontal parallax offset (e.g. driven by a carousel). Vertical uses scrollY. */
  offsetRef?: RefObject<number>;
}): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootsRef = useRef<Shoot[]>([]);

  // Recolour live entities whenever the theme changes — no restart needed.
  useEffect(() => {
    const colors = getPaletteColors(theme);
    for (const st of starsRef.current) st.color = colors[st.colorIndex] ?? colors[0];
    for (const sh of shootsRef.current) sh.color = colors[sh.colorIndex] ?? colors[0];
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getPaletteColors(theme);
    const dpr = window.devicePixelRatio || 1;
    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = (): void => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    starsRef.current = Array.from({ length: NUM_STARS }, () => {
      const depth = Math.random(); // 0 = far/faint, 1 = near/bold
      const colorIndex = depth < 0.4 ? 0 : depth < 0.75 ? 1 : 2;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        parallax: 0.2 + depth * 0.8,
        radius: 0.5 + depth * 2.2,
        baseAlpha: 0.16 + depth * 0.72,
        colorIndex,
        color: colors[colorIndex],
      };
    });
    shootsRef.current = [];

    const mouse: { x: number | null; y: number | null } = { x: null, y: null };

    let rafId = 0;
    let lastTime = 0;
    let shootClock = 0;
    let nextShootAt = 1500;
    // Smoothly lerped horizontal offset — avoids a snap when a carousel slide changes.
    let currentOffX = offsetRef?.current ?? 0;

    const spawnShoot = (): void => {
      const colorIndex = 2; // always use the boldest tier for shooting stars
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.7; // ~45° ± ~20°
      const speed = 6 + Math.random() * 4;
      const sh: Shoot = {
        x: Math.random() * w * 0.4 - w * 0.05,
        y: Math.random() * h * 0.25 - h * 0.05,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        trail: [],
        colorIndex,
        color: colors[colorIndex],
      };
      shootsRef.current.push(sh);
    };

    // Lerp factor per frame at 60fps — closes 8% of the gap each tick.
    const OFF_LERP = 0.08;

    const frame = (timestamp: number): void => {
      rafId = requestAnimationFrame(frame);
      const elapsed = lastTime === 0 ? 16.67 : timestamp - lastTime;
      lastTime = timestamp;
      const dt = Math.min(elapsed / 16.67, 3);

      ctx.clearRect(0, 0, w, h);
      const targetOffX = offsetRef?.current ?? 0;
      currentOffX += (targetOffX - currentOffX) * Math.min(OFF_LERP * dt, 1);
      const scrollY = window.scrollY;

      // Stars (parallax + cursor brightening).
      for (const st of starsRef.current) {
        const sx = (((st.x - currentOffX * st.parallax) % w) + w) % w;
        const sy = (((st.y - scrollY * st.parallax) % h) + h) % h;
        let alpha = st.baseAlpha;
        let r = st.radius;
        if (mouse.x !== null && mouse.y !== null) {
          const d = Math.hypot(sx - mouse.x, sy - mouse.y);
          if (d < STAR_PROXIMITY) {
            const f = 1 - d / STAR_PROXIMITY;
            alpha = Math.min(1, alpha + f * 0.6);
            r = st.radius * (1 + f * 0.6);
          }
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Spawn shooting stars on a randomized cadence.
      shootClock += elapsed;
      if (shootClock > nextShootAt) {
        shootClock = 0;
        nextShootAt = 2500 + Math.random() * 5000;
        spawnShoot();
      }

      // Shooting stars (cursor bend + fading trail).
      const shoots = shootsRef.current;
      for (let i = shoots.length - 1; i >= 0; i--) {
        const sh = shoots[i];
        if (!sh) continue;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - sh.x;
          const dy = mouse.y - sh.y;
          const d = Math.hypot(dx, dy);
          if (d < SHOOT_ORBIT && d > 1) {
            const a = Math.min(SHOOT_PULL / d, 1.2); // capped → only a slight bend
            sh.vx += (dx / d) * a * dt;
            sh.vy += (dy / d) * a * dt;
          }
        }
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.trail.push({ x: sh.x, y: sh.y });
        if (sh.trail.length > MAX_TRAIL) sh.trail.shift();

        ctx.lineCap = 'round';
        for (let t = 1; t < sh.trail.length; t++) {
          const p0 = sh.trail[t - 1];
          const p1 = sh.trail[t];
          if (!p0 || !p1) continue;
          const k = t / sh.trail.length;
          ctx.globalAlpha = k * 0.9;
          ctx.strokeStyle = sh.color;
          ctx.lineWidth = k * 2 + 0.3;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = sh.color;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Only expire once fully off-screen in any direction (200px margin so the
        // trail fades fully before removal; covers mouse-deflected paths too).
        if (sh.x > w + 200 || sh.y > h + 200 || sh.x < -200 || sh.y < -200) {
          shoots.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    const onMove = (e: MouseEvent): void => {
      if (e.clientX >= 0 && e.clientX <= w && e.clientY >= 0 && e.clientY <= h) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    };
    const onLeave = (): void => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);
    frame(0);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
    // offsetRef is a stable ref object — the loop reads .current each frame.
    // theme is intentionally excluded: the separate theme effect patches colors
    // in-place so the loop never needs to restart on a palette change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetRef]);

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />;
}
