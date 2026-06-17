/**
 * @fileoverview Reusable "explore" button — the animated pill from the home-page
 * intro ("Get Started" / "Play with Phil"): an accent circle that expands to fill
 * the pill on hover while an arrow slides across and the label inverts.
 *
 * Renders a real <button> by default, or a react-router <Link> when `to` is given
 * (so it works both as an action and as navigation, e.g. the Dashboard demo gate).
 */
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import './ExploreButton.css';

interface ExploreButtonOwnProps {
  children: ReactNode;
  /** Render as a router link to this path instead of a button. */
  to?: string;
  /** Pixel/rem width override (the label sets the natural width otherwise). */
  width?: string;
  className?: string;
}

type ExploreButtonProps = ExploreButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export function ExploreButton({
  children,
  to,
  width,
  className,
  ...rest
}: ExploreButtonProps): ReactElement {
  const classes = ['explore-btn', className].filter(Boolean).join(' ');
  const style = width ? { width } : undefined;
  const inner = (
    <>
      <span className="circle" aria-hidden="true">
        <span className="icon arrow" />
      </span>
      <span className="button-text">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} style={style} {...rest}>
      {inner}
    </button>
  );
}
