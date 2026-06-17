/**
 * @fileoverview Learn-page progress + navigation menu — pinned top-left under the
 * header. The primary way to move between sections: picking one makes it the
 * active deck. Always rendered; signed-in users see synced progress, signed-out
 * users get a "sign in to save progress" prompt. Built on the shared, bouncy
 * DropdownMenu (which handles the open animation + outside-click/Escape close).
 *
 * Reads AuthContext directly so it degrades to the signed-out state without an
 * <AuthProvider> (e.g. in tests).
 */
import { useContext } from 'react';
import type { ReactElement } from 'react';
import { AuthContext } from '../../../auth/context';
import { GooeyButton } from '../../../components/GooeyButton/GooeyButton';
import { DropdownMenu } from '../../../components/DropdownMenu/DropdownMenu';
import { LEARN_SECTIONS } from '../sections';
import { useLearnProgress } from '../LearnProgressContext';

/** Short, fully-visible labels for the menu (the full titles are too long there). */
const SHORT_TITLES: Record<string, string> = {
  orientation: 'Orientation',
  'how-recommenders-work': 'How They Work',
  'data-and-inference': 'Data & Inference',
  'the-human-cost': 'The Human Cost',
  'why-it-happens': 'Why It Happens',
  'the-law-and-inference': "The Law's Gap",
  'what-user-first-means': 'User-First',
  'building-it-better': 'Building Better',
  'travel-demo': 'The Demo',
};

export function LearnProgressMenu({
  activeSectionId,
  onSelect,
  open,
  setOpen,
}: {
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}): ReactElement {
  const auth = useContext(AuthContext);
  const authenticated = auth?.status === 'authenticated';
  const { status, completedCount, trackableCount } = useLearnProgress();

  const trigger = (
    <GooeyButton
      className="learn-progress-toggle"
      aria-expanded={open}
      onClick={() => {
        setOpen(!open);
      }}
    >
      Progress {completedCount}/{trackableCount}
    </GooeyButton>
  );

  return (
    <div className="learn-progress-anchor">
      <DropdownMenu
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        align="left"
        panelClassName="learn-progress-panel"
        flow={false}
        gooey={false}
        ariaLabel="Sections"
        trigger={trigger}
      >
        <p className="learn-progress-title">Sections</p>
        {LEARN_SECTIONS.map((section) => {
          const st = status[section.id];
          const done = st?.completed ?? false;
          const active = section.id === activeSectionId;
          return (
            <button
              key={section.id}
              type="button"
              role="menuitem"
              aria-current={active}
              className={`learn-progress-row${done ? ' is-complete' : ''}${active ? ' is-active' : ''}`}
              onClick={() => {
                onSelect(section.id);
              }}
            >
              <span className="learn-progress-num">{section.number}</span>
              <span className="learn-progress-name">
                {SHORT_TITLES[section.id] ?? section.title}
              </span>
              <span className="learn-progress-status">
                {section.deferred ? '' : done ? '✓' : `${st?.viewedCount ?? 0}/${st?.total ?? 0}`}
              </span>
            </button>
          );
        })}
        {!authenticated ? (
          <p className="learn-progress-signin">Sign in to save your progress across devices.</p>
        ) : null}
      </DropdownMenu>
    </div>
  );
}
