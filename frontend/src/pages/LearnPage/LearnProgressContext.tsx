/* eslint-disable react-refresh/only-export-components -- Provider and hook are intentionally co-located */
/**
 * @fileoverview Learn-page progress tracking.
 *
 * Records which slides a reader has viewed (per section) and derives completion.
 * Always persisted to localStorage (works signed-out); for **logged-in** users it
 * also syncs to the backend (`learnProgress` on the GraphQL `User`) so progress
 * follows the account across devices. On sign-in the two are unioned. Deferred
 * sections (Travel demo) are excluded from tracking.
 *
 * In the spirit of the course this page teaches: it stores only slide indices
 * and completion booleans — nothing behavioral, nothing inferred.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useMutation, useQuery } from 'urql';
import { AuthContext } from '../../auth/context';
import { graphql } from '../../gql';
import { LEARN_SECTIONS } from './sections';

const STORAGE_KEY = 'bba.learnProgress';

/** The signed-in user's stored Learn-page progress. */
const LearnProgressQuery = graphql(`
  query LearnProgress {
    me {
      id
      learnProgress {
        sectionId
        viewedSlides
      }
    }
  }
`);

/** Record a viewed slide; returns the full updated progress. */
const RecordSlideViewMutation = graphql(`
  mutation RecordSlideView($sectionId: ID!, $slideIndex: Int!) {
    recordSlideView(sectionId: $sectionId, slideIndex: $slideIndex) {
      sectionId
      viewedSlides
    }
  }
`);

export interface SectionStatus {
  viewedCount: number;
  total: number;
  completed: boolean;
}

interface LearnProgressValue {
  /** Per-section status, keyed by section id (deferred sections excluded). */
  status: Record<string, SectionStatus>;
  /** Number of non-deferred sections completed. */
  completedCount: number;
  /** Total trackable (non-deferred) sections. */
  trackableCount: number;
  markViewed: (sectionId: string, slideIndex: number) => void;
  /** Whether a specific slide has been completed (viewed for the dwell time). */
  isSlideViewed: (sectionId: string, slideIndex: number) => boolean;
}

const LearnProgressContext = createContext<LearnProgressValue | null>(null);

type ViewedMap = Record<string, number[]>;

function loadViewed(): ViewedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ViewedMap) : {};
  } catch {
    return {};
  }
}

function saveViewed(v: ViewedMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    // Private mode / quota — progress just won't persist; not fatal.
  }
}

export function LearnProgressProvider({ children }: { children: ReactNode }): ReactElement {
  const auth = useContext(AuthContext);
  const authenticated = auth?.status === 'authenticated';

  // Local state (markViewed + localStorage). Server progress is merged for display
  // in the memo below — no setState-in-effect, so the two sources never fight.
  const [localViewed, setLocalViewed] = useState<ViewedMap>(() => loadViewed());

  // Hydrate from the server when signed in (paused otherwise).
  const [{ data }] = useQuery({ query: LearnProgressQuery, pause: !authenticated });
  const [, recordSlideView] = useMutation(RecordSlideViewMutation);
  const serverProgress = data?.me?.learnProgress;

  const markViewed = useCallback(
    (sectionId: string, slideIndex: number): void => {
      setLocalViewed((prev) => {
        const current = prev[sectionId] ?? [];
        if (current.includes(slideIndex)) return prev;
        const next: ViewedMap = { ...prev, [sectionId]: [...current, slideIndex] };
        saveViewed(next);
        return next;
      });
      // Best-effort server persist for signed-in users; localStorage already holds it.
      if (authenticated) void recordSlideView({ sectionId, slideIndex });
    },
    [authenticated, recordSlideView],
  );

  // Bulk-upload on first sign-in: push any local-only progress (recorded while
  // signed out) up to the server, so the account holds the full union. Runs once
  // per session, after the server data has loaded.
  const bulkPushed = useRef(false);
  useEffect(() => {
    if (!authenticated || !serverProgress || bulkPushed.current) return;
    bulkPushed.current = true;
    const onServer = new Map(serverProgress.map((s) => [s.sectionId, new Set(s.viewedSlides)]));
    for (const [sectionId, slides] of Object.entries(localViewed)) {
      for (const slideIndex of slides) {
        if (!onServer.get(sectionId)?.has(slideIndex)) {
          void recordSlideView({ sectionId, slideIndex });
        }
      }
    }
  }, [authenticated, serverProgress, localViewed, recordSlideView]);

  const value = useMemo<LearnProgressValue>(() => {
    // Effective viewed set = local ∪ server (server adds progress from other devices).
    const viewed: ViewedMap = { ...localViewed };
    if (serverProgress) {
      for (const { sectionId, viewedSlides } of serverProgress) {
        const union = new Set([...(viewed[sectionId] ?? []), ...viewedSlides]);
        viewed[sectionId] = [...union];
      }
    }

    const status: Record<string, SectionStatus> = {};
    let completedCount = 0;
    let trackableCount = 0;
    for (const section of LEARN_SECTIONS) {
      if (section.deferred) continue;
      trackableCount++;
      const total = section.slides.length;
      const seen = viewed[section.id] ?? [];
      const viewedCount = Math.min(seen.filter((i) => i >= 0 && i < total).length, total);
      const completed = total > 0 && viewedCount >= total;
      if (completed) completedCount++;
      status[section.id] = { viewedCount, total, completed };
    }
    const isSlideViewed = (sectionId: string, slideIndex: number): boolean =>
      (viewed[sectionId] ?? []).includes(slideIndex);
    return { status, completedCount, trackableCount, markViewed, isSlideViewed };
  }, [localViewed, serverProgress, markViewed]);

  return <LearnProgressContext.Provider value={value}>{children}</LearnProgressContext.Provider>;
}

export function useLearnProgress(): LearnProgressValue {
  const value = useContext(LearnProgressContext);
  if (!value) {
    throw new Error('useLearnProgress must be used within <LearnProgressProvider>');
  }
  return value;
}
