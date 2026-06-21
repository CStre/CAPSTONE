/**
 * @fileoverview Travel page — full-viewport snap-scroll photo feed with auto-submit.
 *
 * Layout: 4 cols × 2 rows per section; each section snaps to fill the feed.
 * Click the RIGHT half of a photo to like (♥, pink tint).
 * Click the LEFT  half of a photo to dislike (✕, greyscale).
 * Hover for 1 s counts as "engaged" and boosts the dwell signal.
 *
 * Row parallax: entering and exiting sections have rows at staggered offsets that
 * converge to zero when the section is fully snapped (centred in the feed).
 *
 * Sections auto-submit when scrolled off the top — no submit button. The top bar
 * (algorithm toggle + dossier) stays fixed. A per-photo info button (top-right ℹ)
 * reveals photographer details.
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
const PARALLAX_PX = 160; // max row offset in px when adjacent section is fully off-screen
const HOVER_DWELL_MS = 1000; // hover duration before counting as "engaged"
const APP_NAME = 'Building Better Algorithms';

// ── GraphQL ───────────────────────────────────────────────────────────────────

const TravelImagesQuery = graphql(`
  query TravelImages($count: Int!, $driver: Driver!) {
    travelImages(count: $count, driver: $driver) {
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

type Driver = 'A' | 'B';
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

// ── Component ─────────────────────────────────────────────────────────────────

export function TravelPage(): ReactElement {
  const [driver, setDriver] = useState<Driver>('B');
  const [sections, setSections] = useState<FeedSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<{ sectionId: number; photoIdx: number } | null>(
    null,
  );

  const sectionEls = useRef<(HTMLElement | null)[]>([]);
  const sectionIdCounter = useRef(0);
  const isLoadingRef = useRef(false);
  const sectionsRef = useRef<FeedSection[]>([]);
  const pendingDossierRefresh = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const hoverTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFiredRef = useRef(false);

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
            { count: count * SECTION_SIZE, driver },
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
    [client, driver],
  );

  useEffect(() => {
    void loadSections(INITIAL_SECTIONS, true);
  }, [loadSections]);

  // ── Interaction ────────────────────────────────────────────────────────────

  // ── Hold-to-zoom ──────────────────────────────────────────────────────────

  function handlePhotoPointerDown(sectionId: number, photoIdx: number): void {
    holdFiredRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      holdFiredRef.current = true;
      setZoomedPhoto({ sectionId, photoIdx });
    }, 400);
  }

  function handlePhotoPointerUp(): void {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  // Close zoom on Escape.
  useEffect(() => {
    if (!zoomedPhoto) return;
    function handleEsc(e: globalThis.KeyboardEvent): void {
      if (e.key === 'Escape') setZoomedPhoto(null);
    }
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [zoomedPhoto]);

  function handlePhotoClick(
    e: MouseEvent<HTMLDivElement>,
    sectionId: number,
    photoIdx: number,
  ): void {
    // If a hold just fired, swallow the synthetic click — don't react.
    if (holdFiredRef.current) {
      holdFiredRef.current = false;
      return;
    }
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

  // ── Row parallax (on the feed scroll container) ────────────────────────────

  useEffect(() => {
    const feedEl = feedRef.current;
    if (!feedEl) return;

    // Each column has its own speed multiplier; both rows in the same column
    // share that speed so rows stay level with each other.
    const COL_SPEEDS = [0.5, 1.4, 0.8, 1.2];

    function handleScroll(): void {
      if (!feedEl) return;
      const feedH = feedEl.clientHeight;
      if (feedH === 0) return;

      for (const el of sectionEls.current) {
        if (!el) continue;
        const progress = (el.offsetTop - feedEl.scrollTop) / feedH;
        const cells = el.querySelectorAll<HTMLElement>('.travel-cell');
        cells.forEach((cell, idx) => {
          const colIdx = idx % COLS;
          const speed = COL_SPEEDS[colIdx] ?? 1;
          cell.style.translate = `0 ${progress * speed * PARALLAX_PX}px`;
        });
      }
    }

    feedEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      feedEl.removeEventListener('scroll', handleScroll);
    };
  }, [sections.length]);

  // ── Driver switch ──────────────────────────────────────────────────────────

  function switchDriver(next: Driver): void {
    if (next === driver) return;
    setDriver(next);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading && sections.length === 0) return <Loader />;

  const d = dossier.data?.dossier;

  // Resolve the currently zoomed photo for the overlay.
  const zoomedSection = zoomedPhoto
    ? sections.find((s) => s.id === zoomedPhoto.sectionId)
    : undefined;
  const zoomedImg = zoomedSection?.photos[zoomedPhoto?.photoIdx ?? -1];

  return (
    <section className="page travel">
      {/* Controls overlay — floats over the photos, no background bar */}
      <div className="travel-controls">
        <div className="travel-driver" role="tablist" aria-label="Recommendation algorithm">
          {(['A', 'B'] as Driver[]).map((drvr) => (
            <GooeyButton
              key={drvr}
              role="tab"
              aria-selected={driver === drvr}
              className={'travel-driver-tab' + (driver === drvr ? ' is-active' : '')}
              onClick={() => {
                switchDriver(drvr);
              }}
            >
              {drvr === 'A' ? 'Engagement' : 'User-First'}
            </GooeyButton>
          ))}
        </div>
        <GooeyButton
          className="travel-dossier-toggle"
          onClick={() => {
            setShowDossier((s) => !s);
          }}
        >
          See your data
        </GooeyButton>
      </div>

      {/* Dossier modal — same structure and classes as SecurityInfo */}
      {showDossier && d && (
        <div
          className="travel-dossier-overlay"
          onClick={() => {
            setShowDossier(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="What the algorithm has on you"
        >
          <div
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <GlassCard className="travel-dossier-card" maxDeg={1.5}>
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
                <h2 className="travel-dossier-heading">What the algorithm has on you</h2>
              </div>
              <section className="travel-dossier-section">
                <h3>Activity</h3>
                <p>
                  <strong>{d.totalInteractions}</strong> interactions · {d.likes} likes ·{' '}
                  {d.dislikes} dislikes · {d.skips} skips · avg dwell{' '}
                  <strong>{d.avgDwellMs}ms</strong>
                </p>
              </section>
              <section className="travel-dossier-section">
                <h3>Model confidence</h3>
                <p>
                  Confidence <strong>{Math.round(d.confidence * 100)}%</strong> · exploration{' '}
                  <strong>{Math.round(d.exploration * 100)}%</strong>
                </p>
              </section>
              {d.topFeatures.length > 0 && (
                <section className="travel-dossier-section">
                  <h3>Inferred taste</h3>
                  <p>{d.topFeatures.map((f) => f.key).join(', ')}</p>
                </section>
              )}
              {d.inferredTraits.length > 0 && (
                <section className="travel-dossier-section">
                  <h3>Traits</h3>
                  <ul className="travel-dossier-traits">
                    {d.inferredTraits.map((t) => (
                      <li key={t.trait}>{t.trait}</li>
                    ))}
                  </ul>
                </section>
              )}
              <section className="travel-dossier-section">
                <p className="travel-dossier-disclaimer">{d.disclaimer}</p>
              </section>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Hold-to-zoom overlay — appears when user presses and holds a photo */}
      {zoomedImg && (
        <div
          className="travel-zoom-overlay"
          onClick={() => {
            setZoomedPhoto(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed photo"
        >
          <img
            className="travel-zoom-img"
            src={zoomedImg.imageUrl}
            alt={`${zoomedImg.country.name} — photo by ${zoomedImg.photographerName}`}
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
          <p className="travel-zoom-credit">
            {zoomedImg.photographerName} · {zoomedImg.country.name}
          </p>
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
                      onPointerDown={() => {
                        handlePhotoPointerDown(section.id, photoIdx);
                      }}
                      onPointerUp={handlePhotoPointerUp}
                      onPointerCancel={handlePhotoPointerUp}
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
