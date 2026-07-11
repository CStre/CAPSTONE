/**
 * @fileoverview Travel page — full-viewport snap-scroll photo feed with auto-submit.
 *
 * Layout: 4 cols × 2 rows per section; each section snaps to fill the feed.
 * Click the RIGHT half of a photo to like (♥, pink tint).
 * Click the LEFT  half of a photo to dislike (✕, greyscale).
 * Hover for 1 s counts as "engaged" and boosts the dwell signal.
 *
 * Sections auto-submit when scrolled off the top — no submit button. The fixed
 * "See your data" button opens the data-collected contrast. A per-photo info
 * button (top-right ℹ) reveals photographer details.
 *
 * Unsplash compliance: `trackPhotoUse` pings the download endpoint for liked
 * photos; attribution links carry UTM params.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactElement, KeyboardEvent } from 'react';
import { useClient, useMutation, useQuery } from 'urql';
import { graphql } from '../../gql';
import { Loader } from '../../components/Loader/Loader';
import { GooeyButton } from '../../components/GooeyButton/GooeyButton';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import './TravelPage.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const COLS = 4;
const ROWS = 2;
const SECTION_SIZE = COLS * ROWS; // 8 photos per section
const INITIAL_SECTIONS = 2;
const HOVER_DWELL_MS = 1000; // hover duration before counting as "engaged"
const APP_NAME = 'Building Better Algorithms';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const TravelImagesQuery = graphql(`
  query TravelImages($count: Int!) {
    travelImages(count: $count) {
      imageUrl
      attribution
      photographerName
      photographerUrl
      unsplashUrl
      tags
      color
      downloadLocation
      country {
        code
        name
      }
    }
  }
`);

const SubmitFeedbackMutation = graphql(`
  mutation SubmitFeedback($interactions: [InteractionInput!]!) {
    submitFeedback(interactions: $interactions) {
      id
    }
  }
`);

const TrackPhotoUseMutation = graphql(`
  mutation TrackPhotoUse($downloadLocation: String!) {
    trackPhotoUse(downloadLocation: $downloadLocation)
  }
`);

const DossierQuery = graphql(`
  query Dossier {
    dossier {
      totalInteractions
      likes
      dislikes
      skips
      avgDwellMs
      confidence
      exploration
      disclaimer
      inferredTraits {
        trait
        confidence
      }
      topFeatures {
        key
        value
      }
    }
  }
`);

// ── Types ─────────────────────────────────────────────────────────────────────

type PhotoReaction = 'like' | 'dislike' | null;

interface FeedPhoto {
  imageUrl: string;
  photographerName: string;
  photographerUrl: string;
  tags: string[];
  color?: string | null;
  downloadLocation?: string | null;
  country: { code: string; name: string };
  reaction: PhotoReaction;
  engaged: boolean; // true after HOVER_DWELL_MS hover
  viewedAt: number;
}

interface FeedSection {
  id: number;
  photos: FeedPhoto[];
  submitted: boolean;
  enteredAt: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function withUtm(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}utm_source=${encodeURIComponent(APP_NAME)}&utm_medium=referral`;
}

function photoKey(sectionId: number, photoIdx: number): string {
  return `${sectionId}-${photoIdx}`;
}

interface ContrastRow {
  n: number;
  label: string;
}

interface DataContrast {
  total: number;
  bTotal: number;
  aTotal: number;
  ratio: number | null;
  bRows: ContrastRow[];
  aRows: ContrastRow[];
  traits: string[];
}

/**
 * Split the same session's dossier into two ledgers: what the **user-first** algorithm
 * keeps (only the explicit reactions) vs. what an **engagement** algorithm would harvest
 * from the identical taps (every impression, dwell sample, skip, and inference). Both
 * are derived from the one `dossier` query — the contrast is the lesson.
 */
function computeContrast(d: {
  totalInteractions: number;
  likes: number;
  dislikes: number;
  skips: number;
  topFeatures: { key: string }[];
  inferredTraits: { trait: string }[];
}): DataContrast {
  const total = d.totalInteractions;
  const bRows: ContrastRow[] = [
    { n: d.likes, label: 'likes' },
    { n: d.dislikes, label: 'dislikes' },
  ];
  const aRows: ContrastRow[] = [
    { n: total, label: 'impressions logged' },
    { n: total, label: 'dwell-time samples' },
    { n: d.likes + d.dislikes, label: 'reactions' },
    { n: d.skips, label: 'skips' },
    { n: d.topFeatures.length, label: 'inferred taste features' },
    { n: d.inferredTraits.length, label: 'inferred traits' },
    { n: 2, label: 'derived scores' },
  ];
  const bTotal = bRows.reduce((s, r) => s + r.n, 0);
  const aTotal = aRows.reduce((s, r) => s + r.n, 0);
  return {
    total,
    bTotal,
    aTotal,
    ratio: bTotal > 0 ? Math.round(aTotal / bTotal) : null,
    bRows,
    aRows,
    traits: d.inferredTraits.map((t) => t.trait),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TravelPage(): ReactElement {
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);

  const sectionEls = useRef<(HTMLElement | null)[]>([]);
  const sectionIdCounter = useRef(0);
  const isLoadingRef = useRef(false);
  const sectionsRef = useRef<FeedSection[]>([]);
  const pendingDossierRefresh = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const hoverTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const client = useClient();
  const [dossier, refetchDossier] = useQuery({ query: DossierQuery });
  const [, submitFeedback] = useMutation(SubmitFeedbackMutation);
  const [, trackPhotoUse] = useMutation(TrackPhotoUseMutation);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadSections = useCallback(
    async (count: number, reset = false): Promise<void> => {
      if (!reset && isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);
      if (reset) {
        sectionIdCounter.current = 0;
        sectionEls.current = [];
        pendingDossierRefresh.current = false;
      }

      try {
        const result = await client
          .query(
            TravelImagesQuery,
            { count: count * SECTION_SIZE },
            { requestPolicy: 'network-only' },
          )
          .toPromise();

        const raw = result.data?.travelImages;
        if (!raw || raw.length === 0) return;

        const now = Date.now();
        const startId = sectionIdCounter.current;
        const newSections: FeedSection[] = [];

        for (let i = 0; i < count; i++) {
          const slice = raw.slice(i * SECTION_SIZE, (i + 1) * SECTION_SIZE);
          if (slice.length === 0) break;
          newSections.push({
            id: startId + i,
            photos: slice.map((p) => ({
              imageUrl: p.imageUrl,
              photographerName: p.photographerName,
              photographerUrl: p.photographerUrl,
              tags: p.tags,
              color: p.color,
              downloadLocation: p.downloadLocation,
              country: { code: p.country.code, name: p.country.name },
              reaction: null,
              engaged: false,
              viewedAt: now,
            })),
            submitted: false,
            enteredAt: now,
          });
        }

        sectionIdCounter.current += newSections.length;
        if (reset) {
          setSections(newSections);
        } else {
          setSections((prev) => [...prev, ...newSections]);
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [client],
  );

  useEffect(() => {
    void loadSections(INITIAL_SECTIONS, true);
  }, [loadSections]);

  // ── Interaction ────────────────────────────────────────────────────────────

  function handlePhotoClick(
    e: MouseEvent<HTMLDivElement>,
    sectionId: number,
    photoIdx: number,
  ): void {
    // A tap anywhere on the cell closes an open info panel first (no reaction change).
    if (infoOpen !== null) {
      setInfoOpen(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const isRight = e.clientX - rect.left > rect.width / 2;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const photos = [...s.photos];
        const photo = photos[photoIdx];
        if (!photo) return s;
        const newReaction: PhotoReaction = isRight
          ? photo.reaction === 'like'
            ? null
            : 'like'
          : photo.reaction === 'dislike'
            ? null
            : 'dislike';
        photos[photoIdx] = { ...photo, reaction: newReaction };
        return { ...s, photos };
      }),
    );
  }

  function handleKeyDown(
    e: KeyboardEvent<HTMLDivElement>,
    sectionId: number,
    photoIdx: number,
  ): void {
    if (e.key !== 'ArrowRight' && e.key !== 'Enter' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const isLike = e.key === 'ArrowRight' || e.key === 'Enter';
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const photos = [...s.photos];
        const photo = photos[photoIdx];
        if (!photo) return s;
        const newReaction: PhotoReaction = isLike
          ? photo.reaction === 'like'
            ? null
            : 'like'
          : photo.reaction === 'dislike'
            ? null
            : 'dislike';
        photos[photoIdx] = { ...photo, reaction: newReaction };
        return { ...s, photos };
      }),
    );
  }

  function handleMouseEnter(sectionId: number, photoIdx: number): void {
    const key = photoKey(sectionId, photoIdx);
    const timer = setTimeout(() => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          const photos = [...s.photos];
          const photo = photos[photoIdx];
          if (!photo || photo.engaged) return s;
          photos[photoIdx] = { ...photo, engaged: true };
          return { ...s, photos };
        }),
      );
      hoverTimers.current.delete(key);
    }, HOVER_DWELL_MS);
    hoverTimers.current.set(key, timer);
  }

  function handleMouseLeave(sectionId: number, photoIdx: number): void {
    const key = photoKey(sectionId, photoIdx);
    const timer = hoverTimers.current.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      hoverTimers.current.delete(key);
    }
  }

  // Clear pending dwell timers on unmount.
  useEffect(() => {
    const timers = hoverTimers.current;
    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
      });
    };
  }, []);

  // ── Auto-submit ────────────────────────────────────────────────────────────

  const submitSectionRef = useRef<(id: number) => Promise<void>>((_id) => Promise.resolve());

  const submitSection = useCallback(
    async (sectionId: number): Promise<void> => {
      const section = sectionsRef.current.find((s) => s.id === sectionId);
      if (!section || section.submitted) return;

      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, submitted: true } : s)));

      const dwellPerPhoto = Math.round((Date.now() - section.enteredAt) / SECTION_SIZE);

      const interactions = section.photos.map((p) => ({
        imageId: p.imageUrl,
        country: p.country.code,
        tags: p.tags,
        color: p.color ?? null,
        action:
          p.reaction === 'like'
            ? ('like' as const)
            : p.reaction === 'dislike'
              ? ('dislike' as const)
              : ('skip' as const),
        dwellMs: p.engaged ? Math.max(HOVER_DWELL_MS, dwellPerPhoto) : dwellPerPhoto,
        detailsTapped: false,
      }));

      await submitFeedback({ interactions });

      for (const p of section.photos) {
        if (p.reaction === 'like' && p.downloadLocation) {
          void trackPhotoUse({ downloadLocation: p.downloadLocation });
        }
      }
    },
    [submitFeedback, trackPhotoUse],
  );

  useEffect(() => {
    submitSectionRef.current = submitSection;
  }, [submitSection]);

  // ── IntersectionObserver: exit → auto-submit, last section → preload ───────

  const loadSectionsRef = useRef(loadSections);
  useEffect(() => {
    loadSectionsRef.current = loadSections;
  }, [loadSections]);

  useEffect(() => {
    const feedEl = feedRef.current;
    const els = sectionEls.current.filter(Boolean) as HTMLElement[];
    if (!feedEl || els.length === 0) return;

    // Fires when a section exits the feed viewport upward → auto-submit.
    const exitObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && entry.rootBounds) {
            // Section scrolled above the feed (bottom of section < top of feed).
            if (entry.boundingClientRect.bottom <= entry.rootBounds.top) {
              if (pendingDossierRefresh.current) {
                pendingDossierRefresh.current = false;
                refetchDossier({ requestPolicy: 'network-only' });
              }
              const id = parseInt((entry.target as HTMLElement).dataset.sectionId ?? '-1');
              if (id >= 0) {
                void submitSectionRef.current(id);
                pendingDossierRefresh.current = true;
              }
            }
          }
        }
      },
      { root: feedEl, threshold: 0 },
    );

    els.forEach((el) => {
      exitObserver.observe(el);
    });

    // Fires when the last section enters the feed → preload the next one.
    const lastEl = els[els.length - 1];
    let loadObserver: IntersectionObserver | null = null;
    if (lastEl) {
      loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && !isLoadingRef.current) {
            void loadSectionsRef.current(1);
          }
        },
        { root: feedEl, rootMargin: '200px' },
      );
      loadObserver.observe(lastEl);
    }

    return () => {
      exitObserver.disconnect();
      loadObserver?.disconnect();
    };
  }, [sections.length, refetchDossier]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading && sections.length === 0) return <Loader />;

  const d = dossier.data?.dossier;
  const contrast = d ? computeContrast(d) : null;

  return (
    <section className="page travel">
      {/* Controls overlay — floats over the photos, no background bar */}
      <div className="travel-controls">
        <GooeyButton
          className="travel-dossier-toggle"
          onClick={() => {
            setShowDossier((s) => !s);
          }}
        >
          See your data
        </GooeyButton>
      </div>

      {/* "See your data" — the same taps, seen by two algorithms */}
      {showDossier && d && contrast && (
        <div
          className="travel-dossier-overlay"
          onClick={() => {
            setShowDossier(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="What each algorithm collects from you"
        >
          <div
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <GlassCard className="travel-dossier-card travel-dossier-card--contrast" maxDeg={1.5}>
              <button
                type="button"
                className="travel-dossier-close"
                aria-label="Close"
                onClick={() => {
                  setShowDossier(false);
                }}
              >
                ×
              </button>
              <div className="travel-dossier-header">
                <h2 className="travel-dossier-heading">Same taps. Two algorithms.</h2>
                {contrast.total > 0 ? (
                  <p className="travel-dossier-sub">
                    You reacted to <strong>{contrast.total}</strong> photos this session. Here is
                    what each kind of system keeps from that.
                  </p>
                ) : (
                  <p className="travel-dossier-sub">
                    Rate a few photos in the feed, then reopen this to see the difference.
                  </p>
                )}
              </div>

              {contrast.total > 0 && (
                <>
                  <div className="travel-contrast">
                    <div className="travel-contrast-col travel-contrast-col--b">
                      <h3 className="travel-contrast-title">
                        User-First <span>this app</span>
                      </h3>
                      <ul className="travel-contrast-list">
                        {contrast.bRows.map((r) => (
                          <li key={r.label}>
                            <b>{r.n}</b> {r.label}
                          </li>
                        ))}
                      </ul>
                      <p className="travel-contrast-note">
                        Two numbers per country you rated. Nothing else leaves your browser.
                      </p>
                      <div className="travel-contrast-tally">
                        <span className="travel-contrast-num">{contrast.bTotal}</span> data points
                      </div>
                    </div>

                    <div className="travel-contrast-col travel-contrast-col--a">
                      <h3 className="travel-contrast-title">
                        Engagement <span>the usual feed</span>
                      </h3>
                      <ul className="travel-contrast-list">
                        {contrast.aRows.map((r) => (
                          <li key={r.label}>
                            <b>{r.n}</b> {r.label}
                          </li>
                        ))}
                      </ul>
                      {contrast.traits.length > 0 && (
                        <p className="travel-contrast-note travel-contrast-note--a">
                          …and it would guess: {contrast.traits.join(', ')}
                        </p>
                      )}
                      <div className="travel-contrast-tally travel-contrast-tally--a">
                        <span className="travel-contrast-num">{contrast.aTotal}</span> data points
                      </div>
                    </div>
                  </div>

                  <p className="travel-dossier-footer">
                    {contrast.ratio !== null && (
                      <>
                        Same session — <strong>{contrast.ratio}× the data</strong>.{' '}
                      </>
                    )}
                    {d.disclaimer}
                  </p>
                </>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* Snap-scroll feed */}
      <div
        className="travel-feed"
        ref={feedRef}
        onClick={() => {
          setInfoOpen(null);
        }}
      >
        {sections.map((section, sIdx) => (
          <div
            key={section.id}
            className="travel-section"
            data-section-id={section.id}
            ref={(el) => {
              sectionEls.current[sIdx] = el;
            }}
          >
            {Array.from({ length: ROWS }, (_, rowIdx) => (
              <div key={rowIdx} className="travel-row">
                {Array.from({ length: COLS }, (_, colIdx) => {
                  const photoIdx = rowIdx * COLS + colIdx;
                  const photo = section.photos[photoIdx];
                  if (!photo) return null;
                  const key = photoKey(section.id, photoIdx);
                  const isLiked = photo.reaction === 'like';
                  const isDisliked = photo.reaction === 'dislike';
                  return (
                    <div
                      key={colIdx}
                      className={
                        'travel-cell' +
                        (isLiked ? ' is-liked' : '') +
                        (isDisliked ? ' is-disliked' : '') +
                        (photo.engaged ? ' is-engaged' : '')
                      }
                      role="button"
                      tabIndex={0}
                      aria-label={
                        isLiked
                          ? 'Unlike this photo'
                          : isDisliked
                            ? 'Remove dislike'
                            : 'Like or dislike this photo'
                      }
                      aria-pressed={photo.reaction !== null}
                      onClick={(e) => {
                        handlePhotoClick(e, section.id, photoIdx);
                      }}
                      onMouseEnter={() => {
                        handleMouseEnter(section.id, photoIdx);
                      }}
                      onMouseLeave={() => {
                        handleMouseLeave(section.id, photoIdx);
                      }}
                      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                        handleKeyDown(e, section.id, photoIdx);
                      }}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`${photo.country.name} — photo by ${photo.photographerName}`}
                        draggable={false}
                        loading="lazy"
                      />

                      {/* Reaction overlay: ♥ for like, ✕ for dislike */}
                      <div className="travel-cell-overlay" aria-hidden={true}>
                        {isLiked && <span className="travel-cell-heart">♥</span>}
                        {isDisliked && <span className="travel-cell-x">✕</span>}
                      </div>

                      {/* Hover hint: shows ✕ left / ♥ right before a reaction is set */}
                      <div className="travel-cell-sides" aria-hidden={true}>
                        <span className="travel-cell-side travel-cell-side--left">✕</span>
                        <span className="travel-cell-side travel-cell-side--right">♥</span>
                      </div>

                      {/* Info button — top-right corner */}
                      <button
                        type="button"
                        className="travel-cell-info-btn"
                        aria-label="Photo info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoOpen(infoOpen === key ? null : key);
                        }}
                      >
                        i
                      </button>

                      {/* Info panel — appears below the info button */}
                      {infoOpen === key && (
                        <div
                          className="travel-cell-info-panel"
                          role="dialog"
                          aria-label="Photo details"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <p className="travel-cell-info-name">{photo.photographerName}</p>
                          <a
                            className="travel-cell-info-link"
                            href={withUtm(photo.photographerUrl)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View on Unsplash ↗
                          </a>
                          <p className="travel-cell-info-country">{photo.country.name}</p>
                          {photo.tags.length > 0 && (
                            <p className="travel-cell-info-tags">{photo.tags.join(' · ')}</p>
                          )}
                        </div>
                      )}

                      {/* Photographer credit — bottom of cell, shown on hover only */}
                      <a
                        className="travel-cell-credit"
                        href={withUtm(photo.photographerUrl)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        tabIndex={-1}
                        aria-label={`Photo by ${photo.photographerName} on Unsplash`}
                      >
                        {photo.photographerName}
                      </a>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {isLoading && (
          <div className="travel-loading" aria-live="polite">
            Loading…
          </div>
        )}
      </div>
    </section>
  );
}
