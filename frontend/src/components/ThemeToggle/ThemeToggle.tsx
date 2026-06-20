/**
 * @fileoverview Animated day / night theme toggle (uiverse.io / RiccardoRapelli).
 *
 * Checkbox checked = dark mode. State lives in ThemeContext.
 */
import type { ReactElement } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import './ThemeToggle.css';

const STAR_PATH =
  'M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z';

export function ThemeToggle(): ReactElement {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <label className="switch" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <input type="checkbox" className="switch-input" checked={isDark} onChange={toggle} />
      <div className="slider round">
        <div className="sun-moon">
          <svg id="moon-dot-1" className="moon-dot" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="moon-dot-2" className="moon-dot" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="moon-dot-3" className="moon-dot" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="light-ray-1" className="light-ray" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="light-ray-2" className="light-ray" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="light-ray-3" className="light-ray" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="cloud-1" className="cloud-dark" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="cloud-2" className="cloud-dark" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="cloud-3" className="cloud-dark" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="cloud-4" className="cloud-light" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="cloud-5" className="cloud-light" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
          <svg id="cloud-6" className="cloud-light" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" />
          </svg>
        </div>
        <div className="stars">
          <svg id="star-1" className="star" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
          <svg id="star-2" className="star" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
          <svg id="star-3" className="star" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
          <svg id="star-4" className="star" viewBox="0 0 20 20">
            <path d={STAR_PATH} />
          </svg>
        </div>
      </div>
    </label>
  );
}
