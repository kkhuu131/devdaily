## Key pages
- `/` now renders the daily puzzle flow server-side, pre-highlights snippets with Shiki, and hydrates into `PuzzleSession` with `puzzle`, `dayNumber`, and highlighted HTML.
- `/api/puzzle` returns `{ puzzle, dayNumber }` for the current UTC day using `getPuzzleForDate()` and `getDayNumber()`.

## Shared components
- `PuzzleSession` owns the quiz state machine (`IDLE -> QUESTION_1..3 -> REVEALING -> REVEALED`) and persists progress by `puzzleId` in localStorage.
- `QuestionCard` supports both `multiple-choice` and `which-one` formats, while `AnswerOption` handles lock states and correctness visuals.
- `RevealScreen` and `ShareCard` generate and present daily result output, including per-question marks and overall score formatting.

## Known gotchas
- Shiki highlighting is server-only and intentionally singleton-cached in `src/lib/highlight.ts`; do not import this helper from client components.
- Unsupported snippet languages fall back to `typescript`, so new puzzle languages must be added to `SUPPORTED_LANGS` to avoid silent fallback.
- `getDayNumber()` is anchored to `LAUNCH_DATE_UTC`; changing launch date semantics will shift displayed day numbers across the app and API.

## Key Supabase tables
- None in this project yet.

## API routes
- `GET /api/puzzle`: computes today’s puzzle and launch-relative day number on request and responds with JSON payload for client/session consumption.
