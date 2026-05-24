/**
 * @fileoverview Travel page -- swipe-style photo rating experience.
 *
 * Cards are stacked; the next three cards fan out behind and to the right
 * of the active card. Swipe up to like, down to dislike. After the batch
 * is rated, submit sends feedback to the algorithm and loads a fresh set.
 */
import { useState, useRef, useEffect } from 'react';
import type { ReactElement, PointerEvent as ReactPointerEvent } from 'react';
import { useMutation, useQuery } from 'urql';
import { graphql } from '../../gql';
import { Loader } from '../../components/Loader/Loader';
import { LordIcon, ICONS } from '../../components/LordIcon/LordIcon';
import './TravelPage.css';

const TravelImagesQuery = graphql(`
  query TravelImages($count: Int!) {
    travelImages(count: $count) {
      imageUrl
      attribution
      country {
        code
        name
      }
    }
  }
`);

const SubmitFeedbackMutation = graphql(`
  mutation SubmitFeedback($feedback: [FeedbackInput!]!) {
    submitFeedback(feedback: $feedback) {
      id
      preferences {
        value
        country {
          code
        }
      }
    }
  }
`);

const BATCH_SIZE = 8;
const SWIPE_THRESHOLD = 70;

type Rating = 'liked' | 'disliked';

const PREVIEW_PHOTOS = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    attribution: 'Alexandre Perotto',
    country: { code: 'FR', name: 'France' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1543158181-1274e5362710?w=800',
    attribution: 'Romeo A.',
    country: { code: 'JP', name: 'Japan' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=800',
    attribution: 'Caleb Miller',
    country: { code: 'IT', name: 'Italy' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800',
    attribution: 'Florian Wehde',
    country: { code: 'ES', name: 'Spain' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800',
    attribution: 'Dan Freeman',
    country: { code: 'AU', name: 'Australia' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    attribution: 'Sean Oulashin',
    country: { code: 'TH', name: 'Thailand' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800',
    attribution: 'Jason Blackeye',
    country: { code: 'GR', name: 'Greece' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
    attribution: 'Agustin Lautaro',
    country: { code: 'BR', name: 'Brazil' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    attribution: 'Pedro Lastra',
    country: { code: 'DE', name: 'Germany' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    attribution: 'Samuel Zeller',
    country: { code: 'GB', name: 'United Kingdom' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
    attribution: 'Tomas Malik',
    country: { code: 'NO', name: 'Norway' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
    attribution: 'John ONolan',
    country: { code: 'IS', name: 'Iceland' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    attribution: 'Sonika Agarwal',
    country: { code: 'IN', name: 'India' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
    attribution: 'Reiseuhu',
    country: { code: 'MA', name: 'Morocco' },
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    attribution: 'Luca Bravo',
    country: { code: 'CH', name: 'Switzerland' },
  },
];

export function TravelPage(): ReactElement {
  const [ratings, setRatings] = useState<Map<number, Rating>>(() => new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState<'like' | 'dislike' | null>(null);

  const dragStartY = useRef(0);
  const cardAreaRef = useRef<HTMLDivElement>(null);

  const [images, refetchImages] = useQuery({
    query: TravelImagesQuery,
    variables: { count: BATCH_SIZE },
  });
  const [submission, submitFeedback] = useMutation(SubmitFeedbackMutation);

  const photos = images.data?.travelImages ?? PREVIEW_PHOTOS;
  const allSwiped = photos.length > 0 && currentIndex >= photos.length;

  // Prevent the page from scrolling when the user swipes vertically on the card
  useEffect(() => {
    const el = cardAreaRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => {
      e.preventDefault();
    };
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      el.removeEventListener('touchmove', prevent);
    };
  }, []);

  function onPointerDown(e: ReactPointerEvent<HTMLElement>): void {
    if (exiting) return;
    dragStartY.current = e.clientY;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>): void {
    if (!isDragging || exiting) return;
    setDragY(e.clientY - dragStartY.current);
  }

  function onPointerUp(): void {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY < -SWIPE_THRESHOLD) {
      triggerSwipe('like');
    } else if (dragY > SWIPE_THRESHOLD) {
      triggerSwipe('dislike');
    } else {
      setDragY(0);
    }
  }

  function triggerSwipe(verdict: 'like' | 'dislike'): void {
    setExiting(verdict);
    setRatings((prev) => {
      const next = new Map(prev);
      next.set(currentIndex, verdict === 'like' ? 'liked' : 'disliked');
      return next;
    });
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setDragY(0);
      setExiting(null);
    }, 320);
  }

  async function submit(): Promise<void> {
    const feedback = Array.from(ratings).flatMap(([index, verdict]) => {
      const p = photos[index];
      return p ? [{ country: p.country.code, liked: verdict === 'liked' }] : [];
    });
    if (!feedback.length) return;
    const result = await submitFeedback({ feedback });
    if (!result.error) {
      setRatings(new Map());
      setCurrentIndex(0);
      refetchImages({ requestPolicy: 'network-only' });
    }
  }

  if (images.fetching && photos.length === 0) return <Loader />;

  const likeOpacity = Math.min(1, Math.max(0, -dragY / SWIPE_THRESHOLD));
  const dislikeOpacity = Math.min(1, Math.max(0, dragY / SWIPE_THRESHOLD));
  const rotate = -dragY * 0.025;

  let activeTransform = `translateY(${dragY}px) rotate(${rotate}deg)`;
  let activeTransition = isDragging ? 'none' : 'transform 0.3s ease';
  if (exiting === 'like') {
    activeTransform = 'translateY(-160%) rotate(-6deg)';
    activeTransition = 'transform 0.32s ease';
  } else if (exiting === 'dislike') {
    activeTransform = 'translateY(160%) rotate(6deg)';
    activeTransition = 'transform 0.32s ease';
  } else if (!isDragging && dragY === 0) {
    activeTransform = 'translateY(0) rotate(0deg)';
  }

  const currentPhoto = photos[currentIndex];

  return (
    <section className="page travel">
      <h1>Travel</h1>
      <p className="travel-intro">
        Swipe up to like, down to dislike. Submit the batch and the algorithm sharpens your
        per-country scores.
      </p>

      {images.error && photos.length === 0 && (
        <p className="travel-error">Could not load photos: {images.error.message}</p>
      )}
      {submission.error && (
        <p className="travel-error">Could not submit: {submission.error.message}</p>
      )}

      {allSwiped ? (
        <div className="travel-done">
          <LordIcon src={ICONS.travelDone} size={90} trigger="in" state="in-reveal" stroke="bold" />
          <p className="travel-done-text">All photos rated!</p>
          <button
            type="button"
            className="travel-submit"
            disabled={submission.fetching}
            onClick={() => void submit()}
          >
            {submission.fetching ? 'Submitting...' : 'Submit & see new photos'}
          </button>
        </div>
      ) : (
        <>
          <div className="travel-progress">
            {photos.map((_, i) => (
              <div
                key={i}
                className={
                  'travel-pip' +
                  (i < currentIndex
                    ? ' travel-pip--done'
                    : i === currentIndex
                      ? ' travel-pip--current'
                      : '')
                }
              />
            ))}
          </div>

          <div className="travel-panel">
            {/* Clips peeking cards on the right; vertical overflow allowed for swipe exit */}
            <div className="travel-card-clip" ref={cardAreaRef}>
              <div className="travel-card-area">
                {/* Stack cards behind active — render furthest first so closer ones paint on top */}
                {[3, 2, 1].map((offset) => {
                  const idx = currentIndex + offset;
                  if (idx >= photos.length) return null;
                  const photo = photos[idx];
                  if (!photo) return null;
                  return (
                    <article
                      key={`${photo.country.code}-${idx}`}
                      className={`travel-card travel-card--behind travel-card--behind-${offset}`}
                    >
                      <img
                        className="travel-card-photo"
                        src={photo.imageUrl}
                        alt="Travel photo"
                        draggable={false}
                      />
                      <div className="travel-card-footer">
                        <p className="travel-card-credit">{photo.attribution}</p>
                      </div>
                    </article>
                  );
                })}

                {/* Active card */}
                {currentPhoto && (
                  <article
                    className="travel-card travel-card--active"
                    style={{ transform: activeTransform, transition: activeTransition }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    <img
                      className="travel-card-photo"
                      src={currentPhoto.imageUrl}
                      alt="Travel photo"
                      draggable={false}
                    />
                    <div
                      className="travel-overlay travel-overlay--like"
                      style={{ opacity: likeOpacity }}
                    >
                      <span className="travel-stamp travel-stamp--like">LIKE</span>
                    </div>
                    <div
                      className="travel-overlay travel-overlay--dislike"
                      style={{ opacity: dislikeOpacity }}
                    >
                      <span className="travel-stamp travel-stamp--dislike">NOPE</span>
                    </div>
                    <div className="travel-card-footer">
                      <p className="travel-card-credit">{currentPhoto.attribution}</p>
                    </div>
                  </article>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
