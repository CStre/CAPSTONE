/**
 * @fileoverview Canvas tentacle / neural-net animation hook.
 *
 * Extracted from HomePage so the page file stays focused on layout and
 * interaction. The hook takes a ref to a <canvas> element, starts the
 * animation on mount, and cleans up on unmount.
 *
 * Theme changes update colours in-place without restarting the animation.
 */
import { useEffect, useRef } from 'react';

interface Palette {
  strokes: readonly [string, string, string];
  cursor: string;
  nodeActive: string;
  nodeIdle: string;
}

function getPaletteColors(theme: string): Palette {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();
  return theme === 'light'
    ? {
        strokes: [get('--lp-1'), get('--lp-2'), get('--lp-3')],
        cursor: get('--lp-2'),
        nodeActive: get('--lp-1'),
        nodeIdle: get('--lp-3'),
      }
    : {
        strokes: [get('--dp-3'), get('--dp-4'), get('--dp-5')],
        cursor: get('--dp-4'),
        nodeActive: get('--dp-5'),
        nodeIdle: get('--dp-3'),
      };
}

function dist(p1x: number, p1y: number, p2x: number, p2y: number): number {
  return Math.sqrt((p2x - p1x) ** 2 + (p2y - p1y) ** 2);
}

interface Point {
  x: number;
  y: number;
}

class Segment {
  pos: Point;
  l: number;
  ang: number;
  nextPos: Point;
  first: boolean;

  constructor(parent: { nextPos: Point } | Point, l: number, a: number, first: boolean) {
    this.first = first;
    const asPoint = parent as Point;
    const asNext = parent as { nextPos: Point };
    this.pos = first
      ? { x: asPoint.x, y: asPoint.y }
      : { x: asNext.nextPos.x, y: asNext.nextPos.y };
    this.l = l;
    this.ang = a;
    this.nextPos = {
      x: this.pos.x + this.l * Math.cos(this.ang),
      y: this.pos.y + this.l * Math.sin(this.ang),
    };
  }

  update(target: Point): void {
    this.ang = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);
    this.pos.x = target.x + this.l * Math.cos(this.ang - Math.PI);
    this.pos.y = target.y + this.l * Math.sin(this.ang - Math.PI);
    this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
    this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
  }

  fallback(target: Point): void {
    this.pos.x = target.x;
    this.pos.y = target.y;
    this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
    this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
  }
}

class Tentacle {
  x: number;
  y: number;
  l: number;
  n: number;
  rand: number;
  strokeIndex: number;
  color: string;
  nodeActive: string;
  nodeIdle: string;
  segments: Segment[];

  constructor(
    x: number,
    y: number,
    l: number,
    segments: number,
    strokes: readonly [string, string, string],
    nodeActive: string,
    nodeIdle: string,
  ) {
    this.x = x;
    this.y = y;
    this.l = l;
    this.n = segments;
    this.rand = Math.random();
    this.strokeIndex = Math.floor(Math.random() * strokes.length);
    this.color = strokes[this.strokeIndex] ?? strokes[0];
    this.nodeActive = nodeActive;
    this.nodeIdle = nodeIdle;
    this.segments = [new Segment({ x, y }, l / segments, 0, true)];
    for (let i = 1; i < segments; i++) {
      const prev = this.segments[i - 1];
      if (prev) this.segments.push(new Segment(prev, l / segments, 0, false));
    }
  }

  move(lastTarget: Point, target: Point): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    const dt = dist(lastTarget.x, lastTarget.y, target.x, target.y) + 5;
    const t: Point = {
      x: target.x - 0.8 * dt * Math.cos(angle),
      y: target.y - 0.8 * dt * Math.sin(angle),
    };
    const last = this.segments[this.n - 1];
    if (last) last.update(t.x ? t : target);
    for (let i = this.n - 2; i >= 0; i--) {
      const seg = this.segments[i];
      const next = this.segments[i + 1];
      if (seg && next) seg.update(next.pos);
    }
    if (dist(this.x, this.y, target.x, target.y) <= this.l + dt) {
      const first = this.segments[0];
      if (first) first.fallback({ x: this.x, y: this.y });
      for (let i = 1; i < this.n; i++) {
        const seg = this.segments[i];
        const prev = this.segments[i - 1];
        if (seg && prev) seg.fallback(prev.nextPos);
      }
    }
  }

  show(
    target: Point,
    c: CanvasRenderingContext2D,
    maxConnections: number,
    activeConnections: number,
  ): number {
    if (activeConnections >= maxConnections) return activeConnections;
    if (dist(this.x, this.y, target.x, target.y) > this.l) return activeConnections;

    activeConnections++;

    const pts: Point[] = [{ x: this.x, y: this.y }];
    for (let i = 0; i < this.n; i++) {
      const seg = this.segments[i];
      if (seg) pts.push({ x: seg.nextPos.x, y: seg.nextPos.y });
    }

    const first = pts[0];
    if (!first) return activeConnections;

    c.beginPath();
    c.moveTo(first.x, first.y);

    for (let i = 1; i < pts.length - 1; i++) {
      const cur = pts[i];
      const nxt = pts[i + 1];
      if (!cur || !nxt) continue;
      const mx = (cur.x + nxt.x) / 2;
      const my = (cur.y + nxt.y) / 2;
      c.quadraticCurveTo(cur.x, cur.y, mx, my);
    }
    const last = pts[pts.length - 1];
    if (last) c.lineTo(last.x, last.y);

    c.strokeStyle = this.color;
    c.lineWidth = this.rand * 1.5 + 0.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();

    return activeConnections;
  }

  showNode(
    target: Point,
    c: CanvasRenderingContext2D,
    maxConnections: number,
    activeConnections: number,
  ): void {
    if (activeConnections >= maxConnections) return;
    c.beginPath();
    if (dist(this.x, this.y, target.x, target.y) <= this.l) {
      c.arc(this.x, this.y, this.rand * 2 + 1, 0, 2 * Math.PI);
      c.fillStyle = this.nodeActive;
    } else {
      c.arc(this.x, this.y, this.rand * 1.5, 0, 2 * Math.PI);
      c.fillStyle = this.nodeIdle;
    }
    c.fill();
  }
}

/** Starts and tears down the tentacle canvas animation. Theme changes recolour in-place. */
export function useCanvasAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  theme: string,
): void {
  const paletteRef = useRef<Palette>(getPaletteColors(theme));
  const tentsRef = useRef<Tentacle[]>([]);

  // Recolour live tentacles whenever the theme changes — no restart needed.
  useEffect(() => {
    const pal = getPaletteColors(theme);
    paletteRef.current = pal;
    for (const t of tentsRef.current) {
      t.color = pal.strokes[t.strokeIndex] ?? pal.strokes[0];
      t.nodeActive = pal.nodeActive;
      t.nodeIdle = pal.nodeIdle;
    }
  }, [theme]);

  // Main animation — runs once on mount, never restarts.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const c: CanvasRenderingContext2D = ctxOrNull;

    const dpr = window.devicePixelRatio || 1;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    c.scale(dpr, dpr);

    let t = 0;
    const maxl = 300;
    const minl = 50;
    const n = 30;
    const numt = 1000;
    const maxConnections = 20;
    let rafId = 0;

    const mouse: { x: number | false; y: number | false } = { x: false, y: false };
    const lastTarget = { x: w / 2, y: h / 2 };
    const target = { x: w / 2, y: h / 2, errx: 0, erry: 0 };

    const { strokes, nodeActive, nodeIdle } = paletteRef.current;
    const tent: Tentacle[] = [];
    for (let i = 0; i < numt; i++) {
      tent.push(
        new Tentacle(
          Math.random() * w,
          Math.random() * h,
          Math.random() * (maxl - minl) + minl,
          n,
          strokes,
          nodeActive,
          nodeIdle,
        ),
      );
    }
    tentsRef.current = tent;

    function draw(): void {
      let activeConnections = 0;

      if (mouse.x !== false && mouse.y !== false) {
        target.errx = mouse.x - target.x;
        target.erry = mouse.y - target.y;
      } else {
        const p = 8;
        const orbitW = Math.min(w * 0.32, 400);
        const orbitH = Math.min(h * 0.26, 260);
        const ct = Math.cos(t);
        const st = Math.sin(t);
        const r = Math.pow(Math.pow(Math.abs(ct), p) + Math.pow(Math.abs(st), p), -1 / p);
        target.errx = w / 2 + r * ct * orbitW - target.x;
        target.erry = h / 2 + r * st * orbitH - target.y;
      }

      target.x += target.errx / 10;
      target.y += target.erry / 10;
      t += 0.01;

      for (let i = 0; i < numt; i++) tent[i]?.move(lastTarget, target);

      for (let i = 0; i < numt; i++)
        tent[i]?.showNode(target, c, maxConnections, activeConnections);
      for (let i = 0; i < numt; i++) {
        activeConnections =
          tent[i]?.show(target, c, maxConnections, activeConnections) ?? activeConnections;
      }

      // Read cursor colour live from the palette ref so theme changes take effect instantly
      const cursor = paletteRef.current.cursor;
      const headR = Math.max(dist(lastTarget.x, lastTarget.y, target.x, target.y) + 5, 8);
      c.shadowBlur = 18;
      c.shadowColor = cursor;
      c.beginPath();
      c.arc(target.x, target.y, headR, 0, 2 * Math.PI);
      c.fillStyle = cursor;
      c.fill();
      c.shadowBlur = 0;

      lastTarget.x = target.x;
      lastTarget.y = target.y;
    }

    function loop(): void {
      rafId = requestAnimationFrame(loop);
      c.clearRect(0, 0, w, h);
      draw();
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
      const oldW = w;
      const oldH = h;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Rescale all anchor positions proportionally so tentacles cover the full
      // new viewport — prevents blank areas when the window expands.
      const sx = w / oldW;
      const sy = h / oldH;
      for (const ten of tent) {
        ten.x *= sx;
        ten.y *= sy;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [canvasRef]);
}
