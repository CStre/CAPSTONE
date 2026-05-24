/**
 * @fileoverview Particle burst effect for the Get Started CTA.
 *
 * Spawns a shockwave ring and 80 mixed dot/spark particles outward from a
 * click point using the Web Animations API. Particles use the same palette
 * CSS variables as the canvas animation. All DOM elements self-remove via
 * animation.onfinish — the caller needs no cleanup.
 */

export function spawnParticles(x: number, y: number, theme: string): void {
  // Web Animations API absent in jsdom — no-op in test environments
  if (typeof Element.prototype.animate !== 'function') return;
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim();
  const colors =
    theme === 'light'
      ? [get('--lp-1'), get('--lp-2'), get('--lp-3')]
      : [get('--dp-3'), get('--dp-4'), get('--dp-5')];

  // Shockwave ring — expands outward from click point
  const ring = document.createElement('div');
  document.body.appendChild(ring);
  const ringColor = colors[1] ?? colors[0];
  ring.style.cssText = `
    position: fixed;
    left: 0; top: 0;
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 3px solid ${ringColor};
    pointer-events: none;
    will-change: transform, opacity;
    z-index: 9999;
  `;
  const ringAnim = ring.animate(
    [
      { transform: `translate(${x - 10}px, ${y - 10}px) scale(1)`, opacity: 0.9 },
      { transform: `translate(${x - 10}px, ${y - 10}px) scale(18)`, opacity: 0 },
    ],
    { duration: 700, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)', fill: 'forwards' },
  );
  ringAnim.onfinish = () => {
    ring.remove();
  };

  // Particles — mix of large dots and long sparks
  const count = 80;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const isSpark = Math.random() > 0.4;
    const w = isSpark ? Math.random() * 28 + 10 : Math.random() * 12 + 5;
    const h = isSpark ? Math.random() * 4 + 2 : w;
    const color = colors[Math.floor(Math.random() * colors.length)] ?? colors[0];

    el.style.cssText = `
      position: fixed;
      left: 0; top: 0;
      width: ${w}px; height: ${h}px;
      border-radius: ${isSpark ? '3px' : '50%'};
      background: ${color};
      pointer-events: none;
      will-change: transform, opacity;
      z-index: 9999;
    `;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 220 + 80;
    const destX = x + Math.cos(angle) * distance;
    const destY = y + Math.sin(angle) * distance;
    const rotation = isSpark ? Math.random() * 540 : 0;

    const anim = el.animate(
      [
        {
          transform: `translate(${x - w / 2}px, ${y - h / 2}px) scale(1) rotate(0deg)`,
          opacity: 1,
        },
        {
          transform: `translate(${destX - w / 2}px, ${destY - h / 2}px) scale(0.05) rotate(${rotation}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 700 + Math.random() * 800,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: Math.random() * 120,
        fill: 'forwards',
      },
    );

    anim.onfinish = () => {
      el.remove();
    };
  }
}
