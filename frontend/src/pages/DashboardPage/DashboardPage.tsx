/**
 * @fileoverview Brochure page -- the user's per-country preference scores.
 *
 * Reads the full preference map from `me` and shades a modern world map
 * (react-simple-maps, bundled world-atlas TopoJSON) by score, so the user can watch
 * their tastes concentrate as they rate photos on the Travel page. The map renders
 * every country; richer data views land here later.
 */
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useQuery } from 'urql';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import worldData from 'world-atlas/countries-50m.json';
import { useTheme } from '../../lib/ThemeContext';
import { clientToFixed } from '../../lib/pointer';
import { graphql } from '../../gql';
import { Loader } from '../../components/Loader/Loader';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { ExploreButton } from '../../components/ExploreButton/ExploreButton';
import { useLearnProgressOptional } from '../LearnPage/LearnProgressContext';
import './DashboardPage.css';

/** The signed-in user's full preference map. */
const PreferencesQuery = graphql(`
  query Preferences {
    me {
      id
      name
      preferences {
        value
        country {
          code
          name
        }
      }
    }
  }
`);

interface Palette {
  low: string;
  high: string;
  dataless: string;
  stroke: string;
}

function usePalette(): Palette {
  const { theme } = useTheme();
  return theme === 'dark'
    ? { low: '#124E66', high: '#D3D9D4', dataless: '#2E3944', stroke: '#212A31' }
    : { low: '#ADBBDA', high: '#3D52A0', dataless: '#cdd5ea', stroke: '#EDE8F5' };
}

/** Linear interpolate between two hex colours. */
function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const ch = pa.map((v, i) => Math.round(v + ((pb[i] ?? 0) - v) * t));
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// world-atlas country names that differ from our catalog names.
const NAME_ALIAS: Record<string, string> = {
  'united states of america': 'united states',
  'dem. rep. congo': 'dr congo',
  congo: 'republic of the congo',
  'bosnia and herz.': 'bosnia and herzegovina',
  'dominican rep.': 'dominican republic',
  'eq. guinea': 'equatorial guinea',
  'central african rep.': 'central african republic',
  's. sudan': 'south sudan',
  'solomon is.': 'solomon islands',
  'czech rep.': 'czechia',
  'w. sahara': 'western sahara',
  macedonia: 'north macedonia',
  'antigua and barb.': 'antigua and barbuda',
  macao: 'macau',
  vatican: 'vatican city',
  åland: 'åland islands',
  'faeroe is.': 'faroe islands',
  'fr. polynesia': 'french polynesia',
  'n. mariana is.': 'northern mariana islands',
  'st. vin. and gren.': 'saint vincent and the grenadines',
  'british virgin is.': 'british virgin islands',
  'cayman is.': 'cayman islands',
  'cook is.': 'cook islands',
  'falkland is.': 'falkland islands',
  'marshall is.': 'marshall islands',
  'st. kitts and nevis': 'saint kitts and nevis',
  'são tomé and principe': 'são tomé and príncipe',
  'turks and caicos is.': 'turks and caicos islands',
  'u.s. virgin is.': 'u.s. virgin islands',
  // Self-declared / disputed regions absent from the catalog — shade them with their
  // parent country's score so the map has no unexplained gaps.
  somaliland: 'somalia',
  'n. cyprus': 'cyprus',
};

interface GeoFeature {
  rsmKey: string;
  properties: { name?: string };
}

function WorldMap({
  valueByName,
  palette,
}: {
  valueByName: Map<string, number>;
  palette: Palette;
}): ReactElement {
  const [hovered, setHovered] = useState<{ name: string; value: number | null } | null>(null);

  // Cursor-follow: a rAF lerp eases the chip toward the pointer every frame, so it
  // sits beside the cursor when slow and visibly "catches up" on fast moves. Pointer
  // position lives in a ref (no re-render on mousemove); only hover content uses state.
  const chipRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    const tick = (): void => {
      const p = pos.current;
      const t = target.current;
      p.x += (t.x - p.x) * 0.22;
      p.y += (t.y - p.y) * 0.22;
      const el = chipRef.current;
      if (el) {
        const gap = 14;
        // Default below-right of the cursor, but flip to the other side when the chip
        // would overflow the viewport edge (keeps it on-screen near the right/bottom).
        const x =
          p.x + gap + el.offsetWidth > window.innerWidth ? p.x - gap - el.offsetWidth : p.x + gap;
        const y =
          p.y + gap + el.offsetHeight > window.innerHeight
            ? p.y - gap - el.offsetHeight
            : p.y + gap;
        el.style.transform = `translate(${String(x)}px, ${String(y)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  // Memoize the whole layer so moving the mouse (which only updates the tooltip
  // state below) never re-renders the thousands of high-res country paths.
  const geographyLayer = useMemo(
    () => (
      <Geographies geography={worldData}>
        {({ geographies }: { geographies: GeoFeature[] }) =>
          geographies
            .filter((geo) => geo.properties.name !== 'Antarctica')
            .map((geo) => {
              const name = geo.properties.name ?? '';
              const key = name.toLowerCase();
              const value = valueByName.get(key) ?? valueByName.get(NAME_ALIAS[key] ?? '') ?? null;
              const fill =
                value === null ? palette.dataless : lerpHex(palette.low, palette.high, value / 100);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={palette.stroke}
                  strokeWidth={0.3}
                  onMouseEnter={() => {
                    setHovered({ name, value });
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                  }}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', opacity: 0.8 },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
        }
      </Geographies>
    ),
    [valueByName, palette],
  );

  return (
    <>
      <div
        className="dashboard-map"
        onMouseMove={(e) => {
          // Convert to layout coords so the fixed chip tracks the pointer under
          // pinch-zoom on Safari/Firefox (no-op on Chrome — see clientToFixed).
          target.current = clientToFixed(e.clientX, e.clientY);
        }}
      >
        <ComposableMap
          projection="geoEquirectangular"
          projectionConfig={{ scale: 145, center: [0, 12] }}
          width={910}
          height={380}
          style={{ width: '100%', height: 'auto' }}
        >
          {geographyLayer}
        </ComposableMap>
      </div>
      {/* Sibling of the map (not a child) so its position: fixed resolves against the
          viewport — a transformed ancestor would otherwise become its containing block. */}
      <div
        ref={chipRef}
        className={'dashboard-score-chip' + (hovered ? ' is-visible' : '')}
        aria-live="polite"
      >
        {hovered && (
          <>
            <span className="dashboard-score-chip-name">{hovered.name}</span>
            {hovered.value !== null && (
              <span className="dashboard-score-chip-value">{hovered.value}/100</span>
            )}
          </>
        )}
      </div>
    </>
  );
}

export function DashboardPage(): ReactElement {
  const palette = usePalette();
  const learn = useLearnProgressOptional();
  const [result] = useQuery({ query: PreferencesQuery });

  // Hoisted above the gates (hooks must run unconditionally) and memoized so the
  // map's geography layer memo stays stable across tooltip-only re-renders.
  const preferences = result.data?.me?.preferences;
  const valueByName = useMemo(
    () => new Map((preferences ?? []).map((p) => [p.country.name.toLowerCase(), p.value])),
    [preferences],
  );

  // Gate behind the Learn demo: until it's complete there's no Travel feedback yet,
  // so the map would just be a flat, neutral world. Degrades open when there's no
  // LearnProgress provider (e.g. isolated tests).
  if (learn && !learn.demoComplete) {
    return (
      <section className="page dashboard dashboard-gate">
        <GlassCard className="dashboard-gate-card">
          <h2 className="hover-grow">Your data lives here</h2>
          <p className="hover-grow">
            This brochure is where everything the algorithm gathers about you in the travel demo
            comes together — a world map of your country preferences, your strongest and weakest
            picks, and more to come as you rate photos. There's nothing to show yet: the demo
            unlocks once you finish the demo chapter of the course, which teaches you how it all
            works. Learn it first, then come back to explore your data.
          </p>
          <ExploreButton to="/learn" width="14rem">
            Go to Learn
          </ExploreButton>
        </GlassCard>
      </section>
    );
  }

  if (result.fetching) return <Loader />;

  const me = result.data?.me;
  if (result.error ?? !me) {
    return (
      <section className="page">
        <h1>Brochure</h1>
        <p className="dashboard-error">
          {result.error ? result.error.message : 'Sign in to see your preference map.'}
        </p>
      </section>
    );
  }

  const ranked = [...me.preferences].sort((a, b) => b.value - a.value);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const showSummary = top !== undefined && bottom !== undefined && top.value !== bottom.value;

  return (
    <section className="page dashboard">
      <h1>
        {me.name ? (
          <span>
            <span className="dashboard-name">{me.name}</span>
            {"'s Brochure"}
          </span>
        ) : (
          <span>Brochure</span>
        )}
      </h1>
      <p className="dashboard-intro">
        Every country starts neutral. As you like and dislike photos on the Travel page, the
        algorithm nudges these scores -- a brighter shade means a stronger preference.
      </p>

      <WorldMap valueByName={valueByName} palette={palette} />

      {showSummary && (
        <p className="dashboard-summary">
          Strongest preference: <strong>{top.country.name}</strong> ({top.value}/100) &middot;
          weakest: <strong>{bottom.country.name}</strong> ({bottom.value}/100).
        </p>
      )}
    </section>
  );
}
