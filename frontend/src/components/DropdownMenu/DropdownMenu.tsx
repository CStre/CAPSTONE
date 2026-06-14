/**
 * @fileoverview Reusable dropdown menu — a glass panel that springs open and
 * staggers its items in one after another (bouncy). Shared by the header account
 * menu and the Learn-page progress menu.
 *
 * Controlled: the consumer owns `open` and wires its own trigger's onClick. This
 * component renders the trigger + the panel, closes on an outside click or
 * Escape, and animates. Each direct child becomes one staggered row.
 */
import { Children, useEffect, useRef } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
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
  ariaLabel?: string;
  children: ReactNode;
}

export function DropdownMenu({
  open,
  onClose,
  trigger,
  align = 'left',
  panelClassName,
  ariaLabel,
  children,
}: DropdownMenuProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
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
  }, [open, onClose]);

  const panelClasses = [
    'dropdown-panel',
    `dropdown-panel--${align}`,
    panelClassName,
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className="dropdown">
      {trigger}
      <div className={panelClasses} role="menu" aria-label={ariaLabel}>
        {Children.toArray(children).map((child, i) => (
          <div key={i} className="dropdown-item" style={{ '--stagger': i } as CSSProperties}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
