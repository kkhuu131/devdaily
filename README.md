# DevDaily

Daily software craft puzzles: three questions on one concept (code smells, SOLID, design patterns, refactoring, and related principles), with optional code snippets and a short reveal that ties the answers together.

Built with [Next.js](https://nextjs.org) (App Router), React 19, TypeScript, Tailwind CSS v4, and [Shiki](https://shiki.style) (Tokyo Night) for server-rendered syntax highlighting.

## Features

- **Today’s puzzle** (`/`) — Same puzzle for everyone for a given UTC calendar day; advances at UTC midnight.
- **Archive** (`/archive`, `/archive/[day]`) — Replay past days; progress is stored per puzzle and is separate from today’s saved session.
- **About** (`/about`) — Project notes and reading links.
- **Persistence** — Today’s session is stored in `localStorage` under `devdaily_game_state` and resets when the UTC puzzle date changes. Daily streaks are tracked in `devdaily_streak_state` (UTC-based, archive does not affect it). Archive attempts use `devdaily_archive_<puzzleId>`.
- **API** — `GET /api/puzzle` returns `{ puzzle, dayNumber }` for the current UTC day (same selection logic as the home page).

## Getting started

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Content

Puzzles live in `content/puzzles/` as JSON files (see `src/types/puzzle.ts` for the schema). Files are sorted by name; the set **cycles** by day: day *N* uses puzzle index `(N - 1) % puzzleCount`.

The daily calendar anchor is `LAUNCH_DATE_UTC` in `src/lib/puzzle.ts` (day 1 = that UTC date). Update it when you define the real public launch so day numbers line up.

## Project layout

| Path | Role |
|------|------|
| `src/app/` | Routes, root layout, `globals.css` design tokens |
| `src/components/puzzle/` | Session UI, questions, reveal |
| `src/components/layout/` | Header, footer |
| `src/lib/puzzle.ts` | Load puzzles, day number, puzzle-for-date |
| `src/lib/daily-calendar.ts` | UTC date key and “next puzzle” countdown |
| `src/lib/highlight.ts` | Shiki highlighting (server-only) |
| `src/lib/storage.ts` | Today’s `localStorage` helpers |
| `scripts/generate-puzzles.ts` | OpenAI-backed puzzle generation CLI |
| `config/puzzle-pipeline.json` | Generation cadence, mix, and repeat policy |
| `content/puzzle-manifest.json` | Canonical season order + concept history |

## Fonts

[JetBrains Mono](https://www.jetbrains.com/lp/mono/) for UI and code, [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (italic) for display accents — loaded via `next/font` in `src/app/layout.tsx`.

## Deployment

**Live:** [https://playdevdaily.vercel.app](https://playdevdaily.vercel.app)

Any Node host that supports Next.js works (for example [Vercel](https://vercel.com)). Optional: set `NEXT_PUBLIC_SITE_URL` to your canonical URL (see `.env.example`) so metadata and shares stay correct if the deployment hostname changes.

## Puzzle generation pipeline

The content pipeline supports automated batch generation with deterministic validation and dedupe checks.

- Runtime puzzle order now follows `content/puzzle-manifest.json` season order (fallback: file-sort order).
- Repeat policy defaults to **no repeat until concept pool is exhausted**, then spaced reuse.
- `which-one` correctness (`a` vs `b`) is intentionally randomized during generation and injected into the LLM prompt.
- Scheduled generation is **buffer-aware**: it tops up only when days-ahead inventory falls below `targetDaysAheadBuffer`.
- Generation uses OpenAI Structured Outputs (`json_schema`, strict mode) for stronger schema conformance.

### Local generation

```bash
# preview candidates without writing files
npm run puzzles:generate:dry -- --count 10 --seed 42

# generate files + update manifest (requires OPENAI_API_KEY)
OPENAI_API_KEY=your_key_here npm run puzzles:generate -- --count 28 --seed 42

# auto-top-up mode (recommended): no --count, uses targetDaysAheadBuffer
OPENAI_API_KEY=your_key_here npm run puzzles:generate -- --seed 42
```

Useful flags:

- `--count <n>` number of puzzles to generate (`maxBatchSize` in config)
- `--seed <n>` deterministic random seed for category and which-one side selection
- `--dry-run` run full planning/validation without writing files
- `--start-day <n>` optional metadata marker in generation report output

Model selection:

- Default model is `gpt-5-mini`.
- Override with env var `OPENAI_PUZZLE_MODEL` (e.g. `gpt-4.1-mini` for lower cost).
- Generation summary prints token usage and estimated USD cost for supported models.

### CI automation

`.github/workflows/generate-puzzles.yml` runs weekly and can also be triggered manually.

- Requires repository secret: `OPENAI_API_KEY`
- Optional repository variable: `OPENAI_PUZZLE_MODEL`
- Scheduled runs do auto-top-up; manual runs can force fixed size with workflow `count`
- Generates a batch (or skips if buffer is healthy), runs `npm run build`, and opens a PR with generated puzzle files
- Supports manual dry-run via workflow inputs
