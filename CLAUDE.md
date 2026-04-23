## Key pages
- `/` now renders the daily puzzle flow server-side, pre-highlights snippets with Shiki, and hydrates into `PuzzleSession` with `puzzle`, `dayNumber`, and highlighted HTML.
- `/about` renders a static explainer page (game framing, how-it-works flow, reading list, and external GitHub CTA) using the same day-aware header/footer shell as the home page.
- `/api/puzzle` returns `{ puzzle, dayNumber }` for the current UTC day using `getPuzzleForDate()` and `getDayNumber()`.

## Shared components
- `PuzzleSession` owns the quiz state machine (`IDLE -> QUESTION_1..3 -> REVEALING -> REVEALED`) and persists progress by `puzzleId` in localStorage.
- `QuestionCard` supports both `multiple-choice` and `which-one` formats, while `AnswerOption` handles lock states and correctness visuals.
- `RevealScreen` and `ShareCard` generate and present daily result output, including per-question marks and overall score formatting.
- `Header` now makes the `DevDaily` wordmark a home link (`/`) so non-home routes can return to the current daily puzzle in one click.
- `Footer` now includes low-contrast navigation links for `/about` and `/archive`; `/archive` is currently a placeholder destination.

## Known gotchas
- Shiki highlighting is server-only and intentionally singleton-cached in `src/lib/highlight.ts`; do not import this helper from client components.
- Unsupported snippet languages fall back to `typescript`, so new puzzle languages must be added to `SUPPORTED_LANGS` to avoid silent fallback.
- `getDayNumber()` is anchored to `LAUNCH_DATE_UTC`; changing launch date semantics will shift displayed day numbers across the app and API.
- The footer intentionally links to `/archive` before the route exists; until that page is implemented, navigation resolves to Next.js's not-found flow.

## Key Supabase tables
- None in this project yet.

## API routes
- `GET /api/puzzle`: computes today’s puzzle and launch-relative day number on request and responds with JSON payload for client/session consumption.
