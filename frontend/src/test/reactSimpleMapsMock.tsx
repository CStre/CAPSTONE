/**
 * @fileoverview Jest stub for `react-simple-maps`.
 *
 * The real library drags in the d3 chain (d3-geo/d3-zoom/d3-interpolate/d3-color),
 * which is ESM-only and can't be loaded from node_modules under Jest's ESM runtime.
 * The map's rendering isn't under test (DashboardPage tests assert text, not paths),
 * so these no-op components let the page mount without pulling in d3.
 */
import type { ReactElement, ReactNode } from 'react';

export function ComposableMap({ children }: { children?: ReactNode }): ReactElement {
  return <div data-testid="composable-map">{children}</div>;
}

export function Geographies({
  children,
}: {
  children?: ((args: { geographies: never[] }) => ReactNode) | ReactNode;
}): ReactElement {
  return <>{typeof children === 'function' ? children({ geographies: [] }) : children}</>;
}

export function Geography(): ReactElement {
  return <></>;
}
