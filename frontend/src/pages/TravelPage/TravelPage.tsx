/**
 * @fileoverview Travel page — the two-algorithm demo feed.
 *
 * One full-bleed image at a time. The user double-taps (or the ♥ button) to like,
 * ✕ to dislike, or skips to the next without rating. A visible driver toggle flips
 * which algorithm picks the feed: A (engagement) narrows toward your taste; B
 * (user-first) stays diverse. Every interaction is recorded — dwell time, skips,
 * curiosity (details taps) — and submitted as a batch to `submitFeedback`, which
 * updates both algorithms' dossiers.
 *
 * Unsplash compliance: images are hotlinked, the photographer + Unsplash are
 * attributed with linked credit (UTM), and `trackPhotoUse` pings the download
 * endpoint when a photo is used.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useMutation, useQuery } from 'urql';
import { graphql } from '../../gql';
import { Loader } from '../../components/Loader/Loader';
import { GooeyButton } from '../../components/GooeyButton/GooeyButton';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import './TravelPage.css';

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

const BATCH_SIZE = 8;
const DOUBLE_TAP_MS = 300;
const APP_NAME = 'Building Better Algorithms';

type Driver = 'A' | 'B';
type Action = 'like' | 'dislike' | 'skip';

interface RecordedInteraction {
  imageId: string;
  country: string;
  tags: string[];
  color?: string | null;
  action: Action;
  dwellMs: number;
  detailsTapped: boolean;
}

/** Append the Unsplash-required UTM params to a credit link. */
function withUtm(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}utm_source=${encodeURIComponent(APP_NAME)}&utm_medium=referral`;
}

export function TravelPage(): ReactElement {
  const [driver, setDriver] = useState<Driver>('B');
  const [index, setIndex] = useState(0);
  const [interactions, setInteractions] = useState<RecordedInteraction[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showDossier, setShowDossier] = useState(false);

  const dwellStart = useRef<number>(0);
  const lastTap = useRef<number>(0);
  const detailsTappedRef = useRef(false);

  const [images, refetchImages] = useQuery({
    query: TravelImagesQuery,
    variables: { count: BATCH_SIZE, driver },
  });
  const [dossier, refetchDossier] = useQuery({ query: DossierQuery });
  const [submission, submitFeedback] = useMutation(SubmitFeedbackMutation);
  const [, trackPhotoUse] = useMutation(TrackPhotoUseMutation);

  const photos = useMemo(() => images.data?.travelImages ?? [], [images.data]);
  const current = photos[index];
  const allRated = photos.length > 0 && index >= photos.length;

  // Reset the dwell clock and curiosity flag whenever a new card becomes active.
  // (detailsOpen is reset by the handlers that advance the card, to avoid a
  // setState-in-effect cascade.)
  useEffect(() => {
    dwellStart.current = performance.now();
    detailsTappedRef.current = false;
  }, [index, photos]);

  const record = useCallback(
    (action: Action) => {
      const photo = photos[index];
      if (!photo) return;
      const dwellMs = Math.round(performance.now() - dwellStart.current);
      setInteractions((prev) => [
        ...prev,
        {
          imageId: photo.imageUrl,
          country: photo.country.code,
          tags: photo.tags,
          color: photo.color,
          action,
          dwellMs,
          detailsTapped: detailsTappedRef.current,
        },
      ]);
      // Unsplash: trigger the download endpoint when a photo is used (rated).
      if (action !== 'skip' && photo.downloadLocation) {
        void trackPhotoUse({ downloadLocation: photo.downloadLocation });
      }
      setDetailsOpen(false);
      setIndex((i) => i + 1);
    },
    [index, photos, trackPhotoUse],
  );

  function onImagePointerDown(): void {
    const now = performance.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      record('like');
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  function openDetails(): void {
    detailsTappedRef.current = true;
    setDetailsOpen((o) => !o);
  }

  // Keyboard parity: ↑ like, ↓ dislike, → / space skip.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (allRated || !current) return;
      if (e.key === 'ArrowUp') record('like');
      else if (e.key === 'ArrowDown') record('dislike');
      else if (e.key === 'ArrowRight' || e.key === ' ') record('skip');
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [allRated, current, record]);

  async function submit(): Promise<void> {
    const payload = interactions.map((i) => ({
      imageId: i.imageId,
      country: i.country,
      tags: i.tags,
      color: i.color ?? null,
      action: i.action,
      dwellMs: i.dwellMs,
      detailsTapped: i.detailsTapped,
    }));
    const result = await submitFeedback({ interactions: payload });
    if (!result.error) {
      setInteractions([]);
      setIndex(0);
      setDetailsOpen(false);
      refetchImages({ requestPolicy: 'network-only' });
      refetchDossier({ requestPolicy: 'network-only' });
    }
  }

  function switchDriver(next: Driver): void {
    if (next === driver) return;
    setDriver(next);
    setIndex(0);
    setDetailsOpen(false);
    refetchImages({ requestPolicy: 'network-only' });
  }

  if (images.fetching && photos.length === 0) return <Loader />;

  const d = dossier.data?.dossier;

  return (
    <section className="page travel">
      <div className="travel-topbar">
        <div className="travel-driver" role="tablist" aria-label="Recommendation algorithm">
          <button
            type="button"
            role="tab"
            aria-selected={driver === 'A'}
            className={'travel-driver-tab' + (driver === 'A' ? ' is-active' : '')}
            onClick={() => {
              switchDriver('A');
            }}
          >
            Engagement
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={driver === 'B'}
            className={'travel-driver-tab' + (driver === 'B' ? ' is-active' : '')}
            onClick={() => {
              switchDriver('B');
            }}
          >
            User-First
          </button>
        </div>
        <GooeyButton
          className="travel-dossier-toggle"
          onClick={() => {
            setShowDossier((s) => !s);
          }}
        >
          {showDossier ? 'Hide data' : 'See your data'}
        </GooeyButton>
      </div>

      {images.error && photos.length === 0 && (
        <p className="travel-error">Could not load photos: {images.error.message}</p>
      )}
      {submission.error && (
        <p className="travel-error">Could not submit: {submission.error.message}</p>
      )}

      {showDossier && d && (
        <GlassCard className="travel-dossier">
          <h2 className="hover-grow">What the Engagement algorithm has on you</h2>
          <p className="travel-dossier-stat">
            <strong>{d.totalInteractions}</strong> interactions · {d.likes} likes · {d.dislikes}{' '}
            dislikes · {d.skips} skips · avg dwell <strong>{d.avgDwellMs}ms</strong>
          </p>
          <p className="travel-dossier-stat">
            Confidence <strong>{Math.round(d.confidence * 100)}%</strong> · exploration{' '}
            <strong>{Math.round(d.exploration * 100)}%</strong>
          </p>
          {d.topFeatures.length > 0 && (
            <p className="travel-dossier-stat">
              Inferred taste: {d.topFeatures.map((f) => f.key).join(', ')}
            </p>
          )}
          {d.inferredTraits.length > 0 && (
            <ul className="travel-dossier-traits">
              {d.inferredTraits.map((t) => (
                <li key={t.trait}>{t.trait}</li>
              ))}
            </ul>
          )}
          <p className="travel-dossier-disclaimer">{d.disclaimer}</p>
        </GlassCard>
      )}

      {allRated ? (
        <div className="travel-done">
          <p className="travel-done-text">Batch rated.</p>
          <button
            type="button"
            className="travel-submit"
            disabled={submission.fetching || interactions.length === 0}
            onClick={() => void submit()}
          >
            {submission.fetching ? 'Submitting…' : 'Submit & see more'}
          </button>
        </div>
      ) : (
        current && (
          <>
            <div className="travel-progress">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={
                    'travel-pip' +
                    (i < index ? ' travel-pip--done' : i === index ? ' travel-pip--current' : '')
                  }
                />
              ))}
            </div>

            <article className="travel-card">
              <img
                className="travel-card-photo"
                src={current.imageUrl}
                alt="Travel photo"
                draggable={false}
                onPointerDown={onImagePointerDown}
              />

              <button
                type="button"
                className="travel-details-btn"
                aria-expanded={detailsOpen}
                onClick={openDetails}
              >
                ⓘ Details
              </button>

              {detailsOpen && (
                <div className="travel-details">
                  <p className="travel-details-why">
                    {driver === 'A'
                      ? `Shown because it matches your engagement profile${
                          d ? ` (${Math.round(d.confidence * 100)}% confident)` : ''
                        }.`
                      : 'Shown to keep your feed varied — your explicit likes only.'}
                  </p>
                  {current.tags.length > 0 && (
                    <p className="travel-details-tags">
                      Tags: {current.tags.slice(0, 12).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Attribution — always visible, linked, with UTM (Unsplash requirement). */}
              <div className="travel-card-footer">
                <span className="travel-credit">
                  Photo by{' '}
                  <a href={withUtm(current.photographerUrl)} target="_blank" rel="noreferrer">
                    {current.photographerName}
                  </a>{' '}
                  on{' '}
                  <a href={withUtm('https://unsplash.com')} target="_blank" rel="noreferrer">
                    Unsplash
                  </a>
                </span>
              </div>
            </article>

            <div className="travel-actions">
              <GooeyButton
                className="travel-action travel-action--dislike"
                aria-label="Dislike"
                onClick={() => {
                  record('dislike');
                }}
              >
                ✕
              </GooeyButton>
              <GooeyButton
                className="travel-action travel-action--skip"
                aria-label="Skip"
                onClick={() => {
                  record('skip');
                }}
              >
                Skip
              </GooeyButton>
              <GooeyButton
                className="travel-action travel-action--like"
                aria-label="Like"
                onClick={() => {
                  record('like');
                }}
              >
                ♥
              </GooeyButton>
            </div>
            <p className="travel-hint">
              Double-tap the photo to like · ↑ like · ↓ dislike · → skip
            </p>
          </>
        )
      )}
    </section>
  );
}
