/**
 * @fileoverview Jest setup — registers jest-dom matchers for every suite.
 */
import '@testing-library/jest-dom/jest-globals';

// GSAP ScrollTrigger calls window.matchMedia — stub it for jsdom.
/* eslint-disable @typescript-eslint/no-empty-function */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
/* eslint-enable @typescript-eslint/no-empty-function */

// IntersectionObserver is absent in jsdom — stub it so components that use it
// mount without throwing. The stub never fires intersection callbacks.
/* eslint-disable @typescript-eslint/no-empty-function */
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;
/* eslint-enable @typescript-eslint/no-empty-function */
