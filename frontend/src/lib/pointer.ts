/**
 * @fileoverview Pointer-coordinate helper for fixed-position followers (the custom
 * cursor, the Brochure hover chip) under trackpad pinch-zoom.
 *
 * Under a trackpad pinch-zoom, only WebKit (Safari) both reports
 * `MouseEvent.clientX/clientY` relative to the VISUAL viewport *and* keeps fixed
 * elements anchored to the LAYOUT viewport — so a fixed follower drifts, and adding
 * `visualViewport.offset` corrects it. Blink (Chrome) reports layout-relative client
 * coords, and Gecko (Firefox) anchors fixed elements to the visual viewport (the raw
 * client coords already land under the pointer) — in both, the offset must NOT be
 * applied or it double-corrects. Confirmed empirically per engine.
 */

// Safari exposes the WebKit-only `GestureEvent`. Chrome and Firefox are excluded:
// raw client coords already place a fixed follower under the pointer there.
const NEEDS_VV_OFFSET = typeof window !== 'undefined' && 'GestureEvent' in window;

/** Convert pointer client coords to the layout coords that `position: fixed` needs. */
export function clientToFixed(clientX: number, clientY: number): { x: number; y: number } {
  if (!NEEDS_VV_OFFSET) return { x: clientX, y: clientY };
  const vv = window.visualViewport;
  return { x: clientX + (vv?.offsetLeft ?? 0), y: clientY + (vv?.offsetTop ?? 0) };
}
