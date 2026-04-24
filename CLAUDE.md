## Daily puzzle calendar (timezone)
- The **puzzle day** is the **UTC calendar date**: `getDayNumber()` in `src/lib/puzzle.ts` uses `getUTCFullYear` / `getUTCMonth` / `getUTCDate()` anchored to `LAUNCH_DATE_UTC`. The home page, `/api/puzzle`, archive “today” checks, and the **next-puzzle countdown** all use this same **00:00 UTC** rollover.
- **Persisted play state** (`src/lib/storage.ts`) and `PuzzleSession`’s saved `date` field use `getUtcPuzzleDateKey()` from `src/lib/daily-calendar.ts` so localStorage clears when the **UTC** puzzle date changes—not the player’s local midnight.
- **Why UTC, not local midnight:** SSR and the API run with a server clock (often UTC on hosts like Vercel). Using one global calendar keeps the HTML payload, API, countdown, and storage in sync without per-user timezone headers. If we ever switch to “local daily,” we would need an explicit viewer timezone (or client-only day selection) everywhere above.

## Key pages
- `/` now renders the daily puzzle flow server-side, pre-highlights snippets with Shiki, and hydrates into `PuzzleSession` with `puzzle`, `dayNumber`, and highlighted HTML.
- `/about` renders a static explainer page (game framing, how-it-works flow, reading list, and external GitHub CTA) using the same day-aware header/footer shell as the home page.
- `/archive` renders a server-side list of completed day numbers (newest first), includes concept/category metadata, and shows an explicit empty state for day 1 when no prior puzzles exist.
- `/archive/[day]` renders archive play sessions server-side, validates that `day` is numeric and less than today (invalid/too-new values call `notFound()`), and pre-renders Shiki highlights before hydrating the client session.
- `/robots.txt` and `/sitemap.xml` are generated from App Router metadata routes (`src/app/robots.ts`, `src/app/sitemap.ts`) and should always reflect the canonical site URL from `src/lib/site.ts`.
- `/api/puzzle` returns `{ puzzle, dayNumber }` for the current UTC day using `getPuzzleForDate()` and `getDayNumber()`.

## Shared components
- `PuzzleSession` owns the quiz state machine (`IDLE -> QUESTION_1..3 -> REVEALING -> REVEALED`), persists progress by `puzzleId` in localStorage, advances questions only after **Continue** (short fade-out between questions), and saves `COMPLETED` using the live `session.answers` snapshot; on completion it updates UTC-based streak state and passes streak to `Header`/`RevealScreen`/share output. Its idle panel now includes a richer hero layout plus a UTC reset countdown that starts from a client-only placeholder to avoid SSR/client text drift.
- `ArchiveSession` mirrors that flow (same Continue + fade + `QuestionCard` `key`) but stores progress under `devdaily_archive_${puzzleId}` without date-based resets, so archive attempts remain resumable indefinitely.
- `ArchiveSession` and `PuzzleSession` now bootstrap persisted client state through lazy `useState` initializers instead of immediate `setState` calls in `useEffect`, which avoids React 19 `set-state-in-effect` lint violations while keeping hydration stable.
- `QuestionCard` supports `multiple-choice` and `which-one`, shuffles options via `getShuffledOptions()` (seeded by `puzzleId` + question id), shows the selected option’s explanation after lock, and wires **Continue →** to the parent instead of auto-advancing on a timer.
- `AnswerOption` handles lock states and correctness visuals.
- `RevealScreen` and `ShareCard` generate and present daily result output, including per-question marks and overall score formatting; `RevealScreen` embeds `NextPuzzleCountdown`, a client ticker until the next UTC midnight using `daily-calendar.ts`.
- `Header` now makes the `DevDaily` wordmark a home link (`/`) so non-home routes can return to the current daily puzzle in one click.
- `Footer` includes low-contrast navigation links for `/about` and `/archive`; the archive route now resolves to the historical puzzle index.
- `BfCacheReload` (client-only) runs from `RootLayout` and force-reloads restored history entries on `/` and `/archive/<day>` to recover from Next 16/React 19 back-forward non-interactive states.
- `NextPuzzleCountdown` and the home idle countdown both render an initial placeholder (`--:--:--`) and start ticking after mount to avoid impure render-time `Date.now()` usage and SSR/client hydration drift.

## Known gotchas
- Shiki highlighting is server-only and intentionally singleton-cached in `src/lib/highlight.ts`; do not import this helper from client components.
- Unsupported snippet languages fall back to `typescript`, so new puzzle languages must be added to `SUPPORTED_LANGS` to avoid silent fallback.
- `getDayNumber()` is anchored to `LAUNCH_DATE_UTC`; changing launch date semantics will shift displayed day numbers across the app and API.
- **Back/forward + Next 16 / React 19:** the App Router client can stop handling clicks after history navigation even when `pageshow.persisted` is false. `RootLayout` mounts `BfCacheReload` (client effect) to `location.reload()` on `/` and `/archive/<numeric-day>` when the entry is restored from BFCache **or** `PerformanceNavigationTiming.type === 'back_forward'`—expect one extra full load when returning via those controls.
- Structured data JSON-LD now lives in `src/app/head.tsx`; keep executable browser logic out of server-rendered layout markup to avoid script-render and hydration warnings.
- Puzzle JSON on disk may include a UTF-8 BOM; `getAllPuzzles()` strips a leading BOM before `JSON.parse` so editors that emit BOMs do not break the loader.
- Archive day routes intentionally block non-past days (`/archive/[day]` must be `< today`); today's puzzle only lives at `/`.
- Archive localStorage state is intentionally date-agnostic (`devdaily_archive_${puzzleId}`), unlike daily session storage, so old attempts persist until manually cleared.
- Authoring `which-one` puzzles: alternate which version (A vs B) is correct across puzzles so the answer is not always “Version A”; see `AGENTS.md` for the full bias rule and required option prefixes.
- **Shuffled answers:** anything that scores or displays correctness from stored answer **ids** must use `isAnswerCorrect()` in `puzzle-utils.ts` (same `getShuffledOptions` seed as `QuestionCard`). Comparing to the raw JSON `isCorrect` option id breaks after shuffle/remap.
- Puzzle ordering now prefers `content/puzzle-manifest.json` season order (with file-sort fallback). If manifest and puzzle files drift, runtime still works, but intended “season” sequencing can silently change.
- `scripts/generate-puzzles.ts` includes a local `.env.local`/`.env` fallback loader for CLI runs (without Next runtime helpers); CI still needs `OPENAI_API_KEY` provided as a real environment secret.
- OpenAI Structured Outputs in strict mode requires nullable fields to still be listed in `required`; schema relaxations must follow that constraint or the API returns 400 before generation.
- Generation is buffer-aware by default (no `--count`): it skips when `targetDaysAheadBuffer` is already satisfied, so “scheduled run succeeded” can legitimately produce no new files.

## Key Supabase tables
- None in this project yet.

## API routes
- `GET /api/puzzle`: computes today’s puzzle and launch-relative day number on request and responds with JSON payload for client/session consumption.
