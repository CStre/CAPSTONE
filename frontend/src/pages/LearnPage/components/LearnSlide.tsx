/**
 * @fileoverview One Learn-page slide — icon + title + body, rendered as a
 * `.learn-panel`. The body types out (typewriter) while the slide is active; the
 * slide completes only once the typewriter finishes, at which point the
 * approved-check icon reveals in its pre-reserved slot (so nothing shifts).
 *
 * The untyped remainder is rendered invisibly so the final layout is reserved
 * from the start — the text never reflows as it types or when the check appears.
 */
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { LordIcon, ICONS } from '../../../icons';
import { useTypewriter } from '../../../components/Typewriter/useTypewriter';
import type { Slide } from '../types';
import { useLearnProgress } from '../LearnProgressContext';

export function LearnSlide({
  slide,
  index,
  sectionId,
  active,
  onComplete,
}: {
  slide: Slide;
  index: number;
  sectionId: string;
  /** True when this is the deck's current slide (drives the typewriter). */
  active: boolean;
  /** Called when the slide finishes typing (marks it complete). */
  onComplete: () => void;
}): ReactElement {
  const { isSlideViewed } = useLearnProgress();
  const complete = isSlideViewed(sectionId, index);

  // Play the in-reveal animation when the slide becomes active, then switch to
  // hover mode so the icon responds to cursor interaction.
  // All setState calls go through setTimeout to avoid synchronous state updates
  // in the effect body (which can cause cascading renders).
  const [revealing, setRevealing] = useState(false);
  useEffect(() => {
    if (!active) return;
    const startT = setTimeout(() => {
      setRevealing(true);
    }, 0);
    const endT = setTimeout(() => {
      setRevealing(false);
    }, 2200);
    return () => {
      clearTimeout(startT);
      clearTimeout(endT);
    };
  }, [active]);

  const isString = typeof slide.body === 'string';
  const bodyText = typeof slide.body === 'string' ? slide.body : '';
  const shouldType = active && !complete && isString;
  const tw = useTypewriter(bodyText, { enabled: shouldType, onDone: onComplete });

  // Non-string (JSX) bodies can't be typed — complete them as soon as they're active.
  useEffect(() => {
    if (active && !complete && !isString) onComplete();
  }, [active, complete, isString, onComplete]);

  // Split the body into the revealed part and an invisible remainder that holds
  // the final layout (no reflow). complete → all revealed; pending → all hidden.
  let shownText = '';
  let restText = '';
  if (isString) {
    if (complete) shownText = bodyText;
    else if (shouldType) {
      shownText = tw.shown;
      restText = bodyText.slice(tw.shown.length);
    } else restText = bodyText;
  }

  return (
    <section className="learn-panel" data-slide-index={index}>
      {revealing ? (
        <LordIcon
          key="reveal"
          src={slide.icon}
          size={180}
          trigger="in"
          state={slide.inState ?? 'in-reveal'}
          stroke="bold"
          colors={slide.colors}
        />
      ) : (
        <LordIcon
          key="hover"
          src={slide.icon}
          size={180}
          trigger="hover"
          state={slide.hoverState}
          stroke="bold"
          colors={slide.colors}
        />
      )}
      <h2 className="hover-grow">{slide.title}</h2>
      <p className="hover-grow">
        {isString ? (
          <>
            {shownText}
            <span className="learn-type-rest" aria-hidden="true">
              {restText}
            </span>
          </>
        ) : (
          slide.body
        )}
      </p>
      <div className="learn-slide-check-slot">
        {complete ? (
          <LordIcon
            className="learn-slide-check"
            src={ICONS.slideComplete}
            size={64}
            trigger="in"
            state="in-reveal"
            stroke="bold"
          />
        ) : null}
      </div>
    </section>
  );
}
