/* eslint-disable react-refresh/only-export-components -- Provider and hook are intentionally co-located */
/**
 * @fileoverview Shared intro-stage context.
 *
 * Stage meanings:
 *   -2  — theme-toggle only (Header shows only the right island)
 *   -1  — intro off / complete (Header shows everything)
 *   0–5 — slide index currently playing (Header reveals items progressively)
 */
import { createContext, useContext, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface IntroContextValue {
  introStage: number;
  setIntroStage: (stage: number) => void;
}

const IntroContext = createContext<IntroContextValue>({
  introStage: -1,
  setIntroStage: () => undefined,
});

export function IntroProvider({ children }: { children: ReactNode }): ReactElement {
  const [introStage, setIntroStage] = useState(-1);
  return (
    <IntroContext.Provider value={{ introStage, setIntroStage }}>{children}</IntroContext.Provider>
  );
}

export function useIntroStage(): IntroContextValue {
  return useContext(IntroContext);
}
