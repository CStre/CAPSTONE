/**
 * @fileoverview Strings canvas animation hook.
 *
 * Two layered effects share the same canvas:
 *   1. Rope-like strands that wander chaotically.
 *   2. Independent floating specks scattered across the page.
 *
 * When the mouse comes within GRAVITY_RADIUS pixels, nearby strands and specks
 * are pulled toward the cursor. Once inside ORBIT_RADIUS they receive a
 * tangential force that curves their path into an orbit instead of collapsing
 * to the centre. Each entity has a random orbit direction (CW / CCW).
 *
 * All physics are delta-time normalised to 60 fps so the animation runs at
 * the same apparent speed on every browser and display refresh rate.
 *
 * Theme changes recolour all entities in-place without restarting the animation.
 * Colour palette mirrors useCanvasAnimation (--dp-* / --lp-* CSS vars).
 */
import { useEffect, useRef } from 'react';

function getPaletteColors(theme: string): readonly [string, string, string] {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();
  return theme === 'light'
    ? [get('--lp-1'), get('--lp-2'), get('--lp-3')]
    : [get('--dp-3'), get('--dp-4'), get('--dp-5')];
}

interface Vec2 {
  x: number;
  y: number;
}

// ── Tuning constants (all at 60 fps baseline) ─────────────────────────────────

const NUM_STRANDS = 22;
const MAX_SEGMENTS = 32;
const MIN_SEGMENTS = 6;
const SEG_LEN = 18;

const NUM_SPECKS = 60;
const SPECK_RADIUS_MIN = 1.0;
const SPECK_RADIUS_MAX = 3.2;

const WANDER_FORCE = 0.38;
const WANDER_DRIFT = 0.62;
const MAX_SPEED_IDLE = 5.5;
const MAX_SPEED_ACTIVE = 13;
/** Per-frame damping at 60 fps — scaled via Math.pow(DAMPING, dt) each tick. */
const DAMPING = 0.978;

const GRAVITY = 5500;
const MIN_GRAV_DIST = 55;
const GRAVITY_RADIUS = 320;
const ORBIT_RADIUS = 95;
const ORBIT_FORCE = 2.0;

const WALL_MARGIN = 90;
const WALL_FORCE = 0.06;

// ── Shared physics helpers ────────────────────────────────────────────────────

interface Mouse {
  x: number | false;
  y: number | false;
}

function applyWander(
  vx: number,
  vy: number,
  wanderAngle: number,
  head: Vec2,
  w: number,
  h: number,
  dt: number,
): { vx: number; vy: number; wanderAngle: number } {
  const newAngle = wanderAngle + (Math.random() - 0.5) * WANDER_DRIFT * dt;
  let nvx = vx + Math.cos(newAngle) * WANDER_FORCE * dt;
  let nvy = vy + Math.sin(newAngle) * WANDER_FORCE * dt;
  if (head.x < WALL_MARGIN) nvx += (WALL_MARGIN - head.x) * WALL_FORCE * dt;
  if (head.x > w - WALL_MARGIN) nvx -= (head.x - (w - WALL_MARGIN)) * WALL_FORCE * dt;
  if (head.y < WALL_MARGIN) nvy += (WALL_MARGIN - head.y) * WALL_FORCE * dt;
  if (head.y > h - WALL_MARGIN) nvy -= (head.y - (h - WALL_MARGIN)) * WALL_FORCE * dt;
  return { vx: nvx, vy: nvy, wanderAngle: newAngle };
}

function applyMouseForce(
  vx: number,
  vy: number,
  wanderAngle: number,
  head: Vec2,
  mouse: Mouse,
  orbitDir: number,
  w: number,
  h: number,
  dt: number,
): { vx: number; vy: number; wanderAngle: number; inGravField: boolean } {
  if (mouse.x === false || mouse.y === false) {
    const w2 = applyWander(vx, vy, wanderAngle, head, w, h, dt);
    return { ...w2, inGravField: false };
  }

  const mx = mouse.x;
  const my = mouse.y;
  const dx = mx - head.x;
  const dy = my - head.y;
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r >= GRAVITY_RADIUS) {
    const w2 = applyWander(vx, vy, wanderAngle, head, w, h, dt);
    return { ...w2, inGravField: false };
  }

  if (r < 1) return { vx, vy, wanderAngle, inGravField: true };

  const rx = dx / r;
  const ry = dy / r;

  if (r < ORBIT_RADIUS) {
    const tx = -ry * orbitDir;
    const ty = rx * orbitDir;
    const outward = Math.max(0, (ORBIT_RADIUS - r) / ORBIT_RADIUS) * 0.6;
    return {
      vx: vx + (tx * ORBIT_FORCE - rx * outward) * dt,
      vy: vy + (ty * ORBIT_FORCE - ry * outward) * dt,
      wanderAngle,
      inGravField: true,
    };
  }

  const clampedR = Math.max(r, MIN_GRAV_DIST);
  const force = GRAVITY / (clampedR * clampedR);
  return {
    vx: vx + rx * force * dt,
    vy: vy + ry * force * dt,
    wanderAngle,
    inGravField: true,
  };
}

// ── Strand ────────────────────────────────────────────────────────────────────

class Strand {
  pts: Vec2[];
  numSegments: number;
  vx: number;
  vy: number;
  wanderAngle: number;
  colorIndex: number;
  color: string;
  width: number;
  orbitDir: number;

  constructor(x: number, y: number, colors: readonly [string, string, string]) {
    const angle = Math.random() * Math.PI * 2;
    this.numSegments = Math.floor(Math.random() * (MAX_SEGMENTS - MIN_SEGMENTS + 1)) + MIN_SEGMENTS;
    this.pts = Array.from({ length: this.numSegments }, (_, i) => ({
      x: x - Math.cos(angle) * i * SEG_LEN,
      y: y - Math.sin(angle) * i * SEG_LEN,
    }));
    this.vx = Math.cos(angle) * (Math.random() * 3 + 1.5);
    this.vy = Math.sin(angle) * (Math.random() * 3 + 1.5);
    this.wanderAngle = angle;
    this.colorIndex = Math.floor(Math.random() * colors.length);
    this.color = colors[this.colorIndex] ?? colors[0];
    this.width = Math.random() * 1.4 + 0.5;
    this.orbitDir = Math.random() < 0.5 ? 1 : -1;
  }

  update(mouse: Mouse, w: number, h: number, dt: number): void {
    const head = this.pts[0];
    if (!head) return;

    const result = applyMouseForce(
      this.vx,
      this.vy,
      this.wanderAngle,
      head,
      mouse,
      this.orbitDir,
      w,
      h,
      dt,
    );
    this.vx = result.vx;
    this.vy = result.vy;
    this.wanderAngle = result.wanderAngle;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeed = result.inGravField ? MAX_SPEED_ACTIVE : MAX_SPEED_IDLE;
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }
    // Frame-rate-independent damping: same energy loss per second regardless of fps.
    const damp = Math.pow(DAMPING, dt);
    this.vx *= damp;
    this.vy *= damp;

    head.x = Math.max(0, Math.min(w, head.x + this.vx * dt));
    head.y = Math.max(0, Math.min(h, head.y + this.vy * dt));

    for (let i = 1; i < this.numSegments; i++) {
      const prev = this.pts[i - 1];
      const curr = this.pts[i];
      if (!prev || !curr) continue;
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      if (d > SEG_LEN) {
        const factor = (d - SEG_LEN) / d;
        curr.x -= dx * factor;
        curr.y -= dy * factor;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.pts.length < 2) return;
    const first = this.pts[0];
    if (!first) return;

    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < this.pts.length - 1; i++) {
      const cur = this.pts[i];
      const nxt = this.pts[i + 1];
      if (!cur || !nxt) continue;
      ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + nxt.x) / 2, (cur.y + nxt.y) / 2);
    }
    const last = this.pts[this.pts.length - 1];
    if (!last) return;
    ctx.lineTo(last.x, last.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

// ── Speck ─────────────────────────────────────────────────────────────────────

class Speck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wanderAngle: number;
  colorIndex: number;
  color: string;
  radius: number;
  orbitDir: number;

  constructor(x: number, y: number, colors: readonly [string, string, string]) {
    const angle = Math.random() * Math.PI * 2;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * (Math.random() * 3 + 1);
    this.vy = Math.sin(angle) * (Math.random() * 3 + 1);
    this.wanderAngle = angle;
    this.colorIndex = Math.floor(Math.random() * colors.length);
    this.color = colors[this.colorIndex] ?? colors[0];
    this.radius = Math.random() * (SPECK_RADIUS_MAX - SPECK_RADIUS_MIN) + SPECK_RADIUS_MIN;
    this.orbitDir = Math.random() < 0.5 ? 1 : -1;
  }

  update(mouse: Mouse, w: number, h: number, dt: number): void {
    const head: Vec2 = { x: this.x, y: this.y };
    const result = applyMouseForce(
      this.vx,
      this.vy,
      this.wanderAngle,
      head,
      mouse,
      this.orbitDir,
      w,
      h,
      dt,
    );
    this.vx = result.vx;
    this.vy = result.vy;
    this.wanderAngle = result.wanderAngle;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const maxSpeed = result.inGravField ? MAX_SPEED_ACTIVE : MAX_SPEED_IDLE;
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }
    const damp = Math.pow(DAMPING, dt);
    this.vx *= damp;
    this.vy *= damp;

    this.x = Math.max(0, Math.min(w, this.x + this.vx * dt));
    this.y = Math.max(0, Math.min(h, this.y + this.vy * dt));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/** Starts and tears down the strings + specks canvas animation. Theme changes recolour in-place. */
export function useStringsAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  theme: string,
): void {
  const strandsRef = useRef<Strand[]>([]);
  const specksRef = useRef<Speck[]>([]);

  // Recolour live entities whenever the theme changes — no restart needed.
  useEffect(() => {
    const colors = getPaletteColors(theme);
    for (const s of strandsRef.current) s.color = colors[s.colorIndex] ?? colors[0];
    for (const s of specksRef.current) s.color = colors[s.colorIndex] ?? colors[0];
  }, [theme]);

  // Main animation — runs once on mount, never restarts.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx = ctxOrNull;

    const colors = getPaletteColors(theme);

    const dpr = window.devicePixelRatio || 1;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const mouse: Mouse = { x: false, y: false };

    const strands: Strand[] = Array.from(
      { length: NUM_STRANDS },
      () => new Strand(Math.random() * w, Math.random() * h, colors),
    );
    strandsRef.current = strands;

    const specks: Speck[] = Array.from(
      { length: NUM_SPECKS },
      () => new Speck(Math.random() * w, Math.random() * h, colors),
    );
    specksRef.current = specks;

    let rafId = 0;
    let lastTime = 0;

    function loop(timestamp: number): void {
      rafId = requestAnimationFrame(loop);
      // Normalise to 60 fps. Cap at 3× a frame so a tab-resume doesn't teleport entities.
      const elapsed = lastTime === 0 ? 16.67 : timestamp - lastTime;
      lastTime = timestamp;
      const dt = Math.min(elapsed / 16.67, 3);

      ctx.clearRect(0, 0, w, h);
      for (const strand of strands) {
        strand.update(mouse, w, h, dt);
        strand.draw(ctx);
      }
      for (const speck of specks) {
        speck.update(mouse, w, h, dt);
        speck.draw(ctx);
      }
    }

    const onMouseMove = (e: MouseEvent): void => {
      if (e.clientX >= 0 && e.clientX <= w && e.clientY >= 0 && e.clientY <= h) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      } else {
        mouse.x = false;
        mouse.y = false;
      }
    };
    const onMouseLeave = (): void => {
      mouse.x = false;
      mouse.y = false;
    };
    const onResize = (): void => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);
    loop(0);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);
}
