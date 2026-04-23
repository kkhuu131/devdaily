## Key pages
- `/` now renders the daily puzzle flow server-side, pre-highlights snippets with Shiki, and hydrates into `PuzzleSession` with `puzzle`, `dayNumber`, and highlighted HTML.
- `/about` renders a static explainer page (game framing, how-it-works flow, reading list, and external GitHub CTA) using the same day-aware header/footer shell as the home page.
- `/archive` renders a server-side list of completed day numbers (newest first), includes concept/category metadata, and shows an explicit empty state for day 1 when no prior puzzles exist.
- `/archive/[day]` renders archive play sessions server-side, validates that `day` is numeric and less than today (invalid/too-new values call `notFound()`), and pre-renders Shiki highlights before hydrating the client session.
- `/api/puzzle` returns `{ puzzle, dayNumber }` for the current UTC day using `getPuzzleForDate()` and `getDayNumber()`.

## Shared components
- `PuzzleSession` owns the quiz state machine (`IDLE -> QUESTION_1..3 -> REVEALING -> REVEALED`) and persists progress by `puzzleId` in localStorage.
- `ArchiveSession` mirrors `PuzzleSession` gameplay but stores progress under `devdaily_archive_${puzzleId}` without date-based resets, so archive attempts remain resumable indefinitely.
- `QuestionCard` supports both `multiple-choice` and `which-one` formats, while `AnswerOption` handles lock states and correctness visuals.
- `RevealScreen` and `ShareCard` generate and present daily result output, including per-question marks and overall score formatting.
- `Header` now makes the `DevDaily` wordmark a home link (`/`) so non-home routes can return to the current daily puzzle in one click.
- `Footer` includes low-contrast navigation links for `/about` and `/archive`; the archive route now resolves to the historical puzzle index.

## Known gotchas
- Shiki highlighting is server-only and intentionally singleton-cached in `src/lib/highlight.ts`; do not import this helper from client components.
- Unsupported snippet languages fall back to `typescript`, so new puzzle languages must be added to `SUPPORTED_LANGS` to avoid silent fallback.
- `getDayNumber()` is anchored to `LAUNCH_DATE_UTC`; changing launch date semantics will shift displayed day numbers across the app and API.
- Archive day routes intentionally block non-past days (`/archive/[day]` must be `< today`); today's puzzle only lives at `/`.
- Archive localStorage state is intentionally date-agnostic (`devdaily_archive_${puzzleId}`), unlike daily session storage, so old attempts persist until manually cleared.

## Key Supabase tables
- None in this project yet.

## API routes
- `GET /api/puzzle`: computes today’s puzzle and launch-relative day number on request and responds with JSON payload for client/session consumption.
