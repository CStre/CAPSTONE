/**
 * @fileoverview LearnPage icons — the deck status icons plus the per-lesson
 * slide icons. JSON files in `public/icons/LearnPage/` (lesson icons in
 * `Lesson_0…3/`). `slidePlaceholder` and `slideIncomplete` reuse shared files.
 */
export const LEARN_ICONS = {
  // ── Deck status ──────────────────────────────────────────────────────────
  slidePlaceholder: '/icons/shared/wired-outline-426-brain-in-reveal.json',
  slideComplete: '/icons/LearnPage/wired-outline-24-approved-checked-in-reveal.json',
  slideIncomplete: '/icons/shared/wired-outline-25-error-cross-hover-pinch.json',

  // ── Lesson 00 — Orientation ──────────────────────────────────────────────
  learn00Question: '/icons/LearnPage/Lesson_0/wired-outline-424-question-bubble-in-oscillate.json',
  learn00Gift: '/icons/LearnPage/Lesson_0/wired-outline-412-gift-hover-squeeze.json',
  learn00Crowdfunding:
    '/icons/LearnPage/Lesson_0/wired-outline-2374-crowdfunding-hover-add-funds.json',
  learn00Hourglass: '/icons/LearnPage/Lesson_0/wired-outline-472-hourglass-hover-rotation.json',
  learn00Books: '/icons/LearnPage/Lesson_0/wired-outline-779-books-in-reveal.json',

  // ── Lesson 01 — How Recommenders Work ────────────────────────────────────
  learn01Abacus:
    '/icons/LearnPage/Lesson_1/wired-outline-1541-education-mathematics-abacus-hover-pinch.json',
  learn01Branches:
    '/icons/LearnPage/Lesson_1/wired-outline-3395-arrows-up-branches-hover-pinch.json',
  learn01Insights: '/icons/LearnPage/Lesson_1/wired-outline-954-customer-insights-hover-pinch.json',
  learn01Network: '/icons/LearnPage/Lesson_1/wired-outline-26-share-network-hover-pinch.json',
  learn01Funnel:
    '/icons/LearnPage/Lesson_1/wired-outline-736-funnel-tools-utensils-hover-pinch.json',
  learn01Target: '/icons/LearnPage/Lesson_1/wired-outline-458-goal-target-hover-hit.json',
  learn01Stairs: '/icons/LearnPage/Lesson_1/wired-outline-1639-stairs-in-reveal.json',
  learn01Arrow: '/icons/LearnPage/Lesson_1/wired-outline-233-arrow-22-hover-cycle.json',
  learn01FlowChart: '/icons/LearnPage/Lesson_1/wired-outline-3510-flow-chart-hover-pinch.json',
  learn01Map: '/icons/LearnPage/Lesson_1/wired-outline-106-map-hover-pinch.json',

  // ── Lesson 02 — Data and Inference ───────────────────────────────────────
  learn02Hose: '/icons/LearnPage/Lesson_2/wired-outline-1859-water-hose-hover-pinch.json',
  learn02Portrait: '/icons/LearnPage/Lesson_2/wired-outline-3099-portrait-photo-in-reveal.json',
  learn02Puzzle: '/icons/LearnPage/Lesson_2/wired-outline-186-puzzle-in-reveal.json',
  learn02Heartbeat: '/icons/LearnPage/Lesson_2/wired-outline-1249-heart-beat-hover-heart-beat.json',
  learn02Medical:
    '/icons/LearnPage/Lesson_2/wired-outline-1254-medical-mobile-app-hover-pinch.json',
  learn02Business: '/icons/LearnPage/Lesson_2/wired-outline-952-business-network-hover-pinch.json',
  learn02Camera: '/icons/LearnPage/Lesson_2/wired-outline-1928-city-camera-hover-pinch.json',
  learn02Scan: '/icons/LearnPage/Lesson_2/wired-outline-1686-scan-qr-code-hover-pinch.json',
  learn02FolderLock:
    '/icons/LearnPage/Lesson_2/wired-outline-122-folder-lock-hover-adding-files.json',

  // ── Lesson 03 — The Human Cost ───────────────────────────────────────────
  learn03Medicine:
    '/icons/LearnPage/Lesson_3/wired-outline-1232-ayurveda-medicine-hover-pinch.json',
  learn03Meter: '/icons/LearnPage/Lesson_3/wired-outline-1758-meter-measure-hover-pinch.json',
  learn03Brain: '/icons/LearnPage/Lesson_3/wired-outline-2468-brain-mental-moody-hover-pinch.json',
  learn03Fastfood: '/icons/LearnPage/Lesson_3/wired-outline-562-fastfood-hover-pinch.json',
  learn03Phone: '/icons/LearnPage/Lesson_3/wired-outline-721-hand-with-phone-hover-scroll.json',
  learn03Ribbon:
    '/icons/LearnPage/Lesson_3/wired-outline-1250-ribbon-death-cancer-hover-pinch.json',
  learn03Sleep:
    '/icons/LearnPage/Lesson_3/wired-outline-668-sleeping-in-bed-sleepy-hover-pinch.json',
  learn03Coffee: '/icons/LearnPage/Lesson_3/wired-outline-239-coffee-hover-cheers.json',
  learn03Temperature:
    '/icons/LearnPage/Lesson_3/wired-outline-822-fahrenheit-temperature-hover-pinch.json',
} as const;
