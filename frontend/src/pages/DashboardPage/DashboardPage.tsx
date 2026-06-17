/**
 * @fileoverview Dashboard page -- the user's per-country preference scores.
 *
 * Reads the full preference map from `me` and shades a world map (Google
 * GeoChart) by score, so the user can watch their tastes concentrate as they
 * rate photos on the Travel page.
 */
import type { ReactElement } from 'react';
import { useQuery } from 'urql';
import { Chart } from 'react-google-charts';
import { useTheme } from '../../lib/ThemeContext';
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

function useChartOptions() {
  const { theme } = useTheme();
  return theme === 'dark'
    ? {
        colorAxis: { minValue: 0, maxValue: 100, colors: ['#124E66', '#D3D9D4'] },
        backgroundColor: '#212A31',
        datalessRegionColor: '#2E3944',
        defaultColor: '#2E3944',
        legend: 'none',
      }
    : {
        colorAxis: { minValue: 0, maxValue: 100, colors: ['#ADBBDA', '#3D52A0'] },
        backgroundColor: '#EDE8F5',
        datalessRegionColor: '#ADBBDA',
        defaultColor: '#ADBBDA',
        legend: 'none',
      };
}

export function DashboardPage(): ReactElement {
  const chartOptions = useChartOptions();
  const learn = useLearnProgressOptional();
  const [result] = useQuery({ query: PreferencesQuery });

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

  // GeoChart keys regions by ISO 3166-1 alpha-2 code -- exactly our country codes.
  const chartData: (string | number)[][] = [
    ['Country', 'Preference'],
    ...me.preferences.map((p) => [p.country.code, p.value]),
  ];

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
        algorithm nudges these scores -- brighter green means a stronger preference.
      </p>

      <div className="dashboard-map">
        <Chart
          chartType="GeoChart"
          width="100%"
          height="500px"
          data={chartData}
          options={chartOptions}
          loader={<Loader />}
        />
      </div>

      {showSummary && (
        <p className="dashboard-summary">
          Strongest preference: <strong>{top.country.name}</strong> ({top.value}/100) &middot;
          weakest: <strong>{bottom.country.name}</strong> ({bottom.value}/100).
        </p>
      )}
    </section>
  );
}
