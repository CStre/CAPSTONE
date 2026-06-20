/**
 * @fileoverview Reusable bouncy dropdown menu — a glass panel that springs open
 * and staggers its items in one after another. Shared by the header account menu
 * and the Learn-page progress menu.
 *
 * The panel is rendered through a portal to <body> and positioned `fixed` from the
 * trigger's rect, so it is fully detached from its parent: it "pops off" as its own
 * floating layer and is never dragged or deformed by an animated ancestor (e.g. the
 * header island's gooey squash-and-stretch). It then carries the *same* island feel
 * itself — the elastic cursor pull (top/left) and gooey squash (transform) — so it
 * reads as part of the header and feels just as fluid. Those effects run only while
 * open (range 0 disables them when closed). The open/close scale lives on an inner
 * wrapper so it never fights the gooey transform on the panel.
 *
 * The consumer owns `open` and wires its trigger's onClick; this component renders
 * the trigger + the portaled panel, closes on an outside click or Escape, animates.
 */
import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useElasticOffset } from '../GlassIsland/useElasticOffset';
import { useGooeyEffect } from '../GlassIsland/useGooeyEffect';
import './DropdownMenu.css';

export interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  /** The clickable trigger element (wire its own onClick to toggle `open`). */
  trigger: ReactNode;
  /** Horizontal alignment of the panel relative to the trigger. */
  align?: 'left' | 'center' | 'right';
  /** Extra class on the panel (e.g. for width). */
  panelClassName?: string;
  /** Whether the open panel does the elastic cursor-drift ("flow"). Defaults to true. */
  flow?: boolean;
  /** Whether the open panel does the gooey squash. Defaults to true. */
  gooey?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

/** Gap (px) between the trigger and the panel — ~0.55rem. */
const GAP = 8.8;

export function DropdownMenu({
  open,
  onClose,
  trigger,
  align = 'left',
  panelClassName,
  flow = true,
  gooey = true,
  ariaLabel,
  children,
}: DropdownMenuProps): ReactElement {
  const triggerRef = useRef<HTMLDivElement>(null);
  // The panel can carry the island feel: an optional gooey squash and an optional
  // elastic cursor-drift ("flow"). Both are inert while closed (range 0) so a hidden
  // panel doesn't react to the cursor, and each can be turned off per instance.
  const flowing = open && flow;
  const { ref: panelRef, tx, ty } = useElasticOffset(flowing ? 0.16 : 0, flowing ? 190 : 0);
  useGooeyEffect(panelRef, open && gooey ? 260 : 0);
  // Fixed viewport coords of the panel's top-left (null until first opened).
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Centre/right by measured width (no translateX) so the panel's own transform
    // stays free for the gooey squash.
    const width = panelRef.current?.offsetWidth ?? 0;
    const left =
      align === 'center'
        ? rect.left + rect.width / 2 - width / 2
        : align === 'right'
          ? rect.right - width
          : rect.left;
    setPos({ top: rect.bottom + GAP, left });
  }, [align, panelRef]);

  // Track the trigger position while open (so scroll/resize keep the panel anchored).
  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Close on outside click (trigger and panel both count as "inside") or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, panelRef]);

  const panelClasses = [
    'dropdown-panel',
    `dropdown-panel--${align}`,
    panelClassName,
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  // Anchor + elastic offset. Keep the last position while closing so the
  // out-animation plays in place.
  const panelStyle: CSSProperties = pos
    ? { top: pos.top + ty, left: pos.left + tx }
    : { top: -9999, left: -9999 };

  return (
    <div ref={triggerRef} className="dropdown">
      {trigger}
      {createPortal(
        <div
          ref={panelRef}
          className={panelClasses}
          role="menu"
          aria-label={ariaLabel}
          style={panelStyle}
        >
          <div className="dropdown-spring">
            {Children.toArray(children).map((child, i) => (
              <div key={i} className="dropdown-item" style={{ '--stagger': i } as CSSProperties}>
                {child}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
