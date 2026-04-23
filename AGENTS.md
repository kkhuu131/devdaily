<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DevDaily — Claude Code Project Memory

## What This Project Is

DevDaily is a **daily software engineering puzzle game** for developers. Every day, players get
3 questions all focused on the same concept (code smells, SOLID principles, design patterns, 
refactoring principles). One guess per question. After all 3, the concept is revealed with a 
definition, book citation, and link to learn more. Think Wordle meets software craftsmanship education.

**This is NOT:**
- A LeetCode-style algorithm puzzle game
- A syntax or language quiz
- A trivia app
- A coding challenge where you write code
- An interview prep tool

**This IS:**
- A judgment and pattern recognition game
- About craft knowledge from books like Refactoring (Fowler), Clean Code (Uncle Bob), 
  The Pragmatic Programmer, and GoF Design Patterns
- Designed to teach through play — players learn the vocabulary by recognizing the concept
  in real scenarios, not by being tested on memorized definitions
- A 2-3 minute daily habit, not a deep learning platform

---

## Product Name

**DevDaily** — always written exactly this way, never "Dev Daily" or "devdaily".

---

## Core Game Mechanics (DO NOT DEVIATE FROM THESE)

### Daily Session Structure
- Exactly **3 questions per day**, all on the **same concept**
- Questions escalate in difficulty: Q1 (easy recognition) → Q2 (moderate) → Q3 (hardest judgment call)
- **One guess per question, no retries** — the stakes create engagement
- After all 3 questions: reveal screen with concept name, definition, citation, link
- Daily puzzle resets at **midnight UTC**, seeded by date (deterministic — everyone gets same puzzle)

### Question Formats
- **Q1:** Multiple choice — 4 options written in plain English (never show the concept name as an option)
- **Q2:** Multiple choice — slightly more subtle scenario
- **Q3:** "Which one?" format — two code snippets side by side, pick the problematic one
  OR true/false with a nuanced reason

### What Questions Look Like
- Always scenario-based — show a **code snippet** or describe a **real situation**
- Options are plain English descriptions of the problem, never jargon or concept names
- Wrong answer options should be plausible — things a reasonable developer might think
- Example of a GOOD option: "This method is more interested in another class's data than its own"
- Example of a BAD option: "This is a Feature Envy code smell" (never name the concept in options)

### Reveal Screen (After All 3 Questions)
Shows all of these, in order:
1. Score out of 3 (e.g., "2/3")
2. Concept name (e.g., "Feature Envy")
3. One-sentence plain English definition
4. A "rule of thumb" — a heuristic the player will actually remember
5. Book citation: Author, Book Title, Chapter, page if available
6. External link to refactoring.guru or equivalent free resource
7. Share card with copy button

### Shareable Result Card (Plain Text)
Format exactly like this — no deviations:
```
🧠 DevDaily #47 — Feature Envy

Q1 ✅  Q2 ✅  Q3 ❌
Score: 2/3 • Streak: 12

devdaily.dev
```
This must work as plain text in Twitter/X, Slack, Discord, Zenn, LinkedIn.
No images for the share card — text only so it works everywhere.

---

## Tech Stack (LOCKED — Do Not Suggest Alternatives)

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode — `"strict": true` in tsconfig)
- **Styling:** Tailwind CSS only — no CSS-in-JS, no styled-components, no emotion
- **Syntax highlighting:** Shiki (not highlight.js, not Prism) — better TypeScript support
- **Database/Auth:** Supabase (PostgreSQL + Row Level Security + Google OAuth)
- **Deployment:** Vercel
- **Package manager:** pnpm (not npm, not yarn)
- **No external UI component libraries** — build all components from scratch

If you want to suggest an alternative to any of these, ask first. Do not silently substitute.

---

## Project Structure (Follow Exactly)

```
devdaily/
├── CLAUDE.md                    ← this file
├── .env.local                   ← never commit this
├── .env.example                 ← commit this with placeholder values
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
│
├── content/
│   └── puzzles/
│       ├── 001-feature-envy.json
│       ├── 002-single-responsibility.json
│       └── ...                  ← one file per puzzle concept
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← root layout, fonts, metadata
│   │   ├── page.tsx             ← today's puzzle (main game)
│   │   ├── archive/
│   │   │   └── page.tsx         ← past puzzles, no streak stakes
│   │   ├── about/
│   │   │   └── page.tsx         ← what is DevDaily, reading list
│   │   └── api/
│   │       └── puzzle/
│   │           └── route.ts     ← returns today's puzzle JSON
│   │
│   ├── components/
│   │   ├── puzzle/
│   │   │   ├── CodeSnippet.tsx      ← syntax-highlighted code block
│   │   │   ├── AnswerOption.tsx     ← single answer button (4 states)
│   │   │   ├── QuestionCard.tsx     ← one full question
│   │   │   ├── PuzzleSession.tsx    ← manages 3-question state machine
│   │   │   └── RevealScreen.tsx     ← post-game reveal
│   │   ├── ui/
│   │   │   ├── ShareCard.tsx        ← shareable result display
│   │   │   ├── StreakCounter.tsx     ← flame icon + number
│   │   │   ├── ProgressDots.tsx     ← Q1 Q2 Q3 indicator
│   │   │   └── ThemeToggle.tsx      ← dark/light switch
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── puzzle.ts            ← getPuzzleForDate(), getPuzzleByIndex()
│   │   ├── storage.ts           ← localStorage read/write for game state
│   │   ├── share.ts             ← generates share card text
│   │   └── supabase.ts          ← supabase client (browser + server)
│   │
│   └── types/
│       └── puzzle.ts            ← all TypeScript types for puzzle data
```

---

## TypeScript Types (These Are Locked — Do Not Rename or Restructure)

```typescript
// src/types/puzzle.ts

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'code-smell' | 'solid' | 'design-pattern' | 'principle' | 'refactoring';
export type QuestionFormat = 'multiple-choice' | 'which-one' | 'true-false';

export interface AnswerOption {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean;
  explanation: string; // shown after reveal — why this is right/wrong
}

export interface Question {
  id: 1 | 2 | 3;
  format: QuestionFormat;
  difficulty: Difficulty;
  prompt: string;               // the question text
  codeSnippet?: string;         // optional — the code to display
  language?: string;            // 'typescript' | 'python' | 'java' etc
  options: AnswerOption[];
}

export interface PuzzleCitation {
  author: string;
  bookTitle: string;
  chapter: string;
  page?: string;
  externalUrl: string;          // refactoring.guru or similar free resource
}

export interface Puzzle {
  id: number;                   // sequential, used for puzzle number in share card
  conceptName: string;          // e.g. "Feature Envy"
  category: Category;
  definition: string;           // one sentence, plain English
  ruleOfThumb: string;          // the heuristic that sticks
  citation: PuzzleCitation;
  questions: [Question, Question, Question]; // always exactly 3
}
```

---

## Design System

### Aesthetic Direction

**"Terminal Craft"** — The entire UI speaks the language of the developer's environment. JetBrains Mono is used for ALL text (UI labels, prompts, option text, metadata), not just code blocks. Code snippets feel native, not intrusive. The only typographic exception is the concept name on the reveal screen, which breaks into a large display serif (`Instrument Serif`, italic) — that single moment of contrast is the "aha" made physical.

The palette is warm-dark: near-black with a faint warm undertone (not cold VS Code blue-gray), amber as the brand/interactive accent (achievement, CRT terminal energy), and keeps green/red for correct/wrong. This avoids generic "dark SaaS" aesthetics while remaining immediately comfortable for developers.

**The one unforgettable detail:** Selecting a wrong answer plays a subtle `shake` animation. Correct answer glows briefly before auto-advancing. Concept name typewriter-animates in on the reveal.

### Colors (CSS Variables — Use These Names Everywhere)

```css
:root {
  /* Backgrounds — warm dark, not cold blue-gray */
  --bg-base: #0e0d0b;              /* page background */
  --bg-surface: #181714;           /* cards */
  --bg-elevated: #222018;          /* hover states, elevated elements */
  --bg-code: #131210;              /* code block — slightly deeper */

  /* Text — warm off-white, not stark */
  --text-primary: #e4e0d4;
  --text-secondary: #7a7568;       /* labels, metadata */
  --text-muted: #3e3b34;           /* placeholders, disabled */

  /* Accents */
  --accent-brand: #d4a843;         /* amber — interactive, selected, focus rings */
  --accent-brand-subtle: #2e2510;  /* amber tint for selected-option background */
  --accent-correct: #52c97a;       /* green — correct answer */
  --accent-correct-subtle: #0e2a18;/* green tint background */
  --accent-wrong: #e0574f;         /* warm red — wrong answer */
  --accent-wrong-subtle: #2a0e0e;  /* red tint background */
  --accent-neutral: #3a3730;       /* unselected answer borders */

  /* Borders */
  --border-subtle: #252320;        /* card borders */
  --border-focus: #d4a843;         /* focus ring — same as brand */
}
```

Never use arbitrary hex values in components — always reference CSS variables.

### Typography

**This is load-bearing — do not deviate.**

- **ALL UI text:** JetBrains Mono — labels, prompts, option text, headers, metadata, everything
- **Code snippets:** JetBrains Mono (same font — seamless integration)
- **Concept name on reveal ONLY:** `Instrument Serif` (Google Fonts), large, italic — the single typographic contrast in the app
- Never use font sizes below `text-sm` (14px) for readable content
- Set JetBrains Mono as the Tailwind `fontFamily.mono` default AND as `fontFamily.sans` so `font-sans` classes pick it up automatically

Load both fonts via `next/font/google` in `src/app/layout.tsx`.

### Shiki Syntax Highlighting Theme

Use Shiki's built-in `"tokyo-night"` theme — it has warm dark tones that complement the palette. Do not use a custom theme unless `"tokyo-night"` visually clashes after testing.

### Spacing

Follow Tailwind's default scale. No custom spacing values.

### Page Layout

Single column, `max-w-[640px]`, horizontally centered, `px-4` on mobile. The puzzle IS the page — no sidebars, no distractions.

**Game page structure (top → bottom):**
```
Header: [DevDaily]                     [🔥 12  #47]
────────────────────────────────────────────────────
Progress: ● ● ○   Q2 of 3
────────────────────────────────────────────────────
Question card:
  Prompt text (mono, text-base)
  Code snippet (full width within card, if applicable)

Answer options (vertical stack):
  [a]  Option text here...
  [b]  Option text here...
  [c]  Option text here...
  [d]  Option text here...
────────────────────────────────────────────────────
Footer: minimal — "devdaily.dev" only
```

**Reveal screen structure (replaces question + options):**
```
  2 / 3   ✅ ✅ ❌

  Today's concept

  Feature Envy                  ← Instrument Serif, large, italic, amber
  ────────────────────────────
  Plain English definition here...

  Rule of thumb
  ┃ If a method uses more features of another class
  ┃ than its own, move it there.        ← amber left-border block

  Martin Fowler · Refactoring · Ch. 3

  [Copy result]          [Learn more →]
```

### Component States for AnswerOption

The answer button has exactly these 5 states — handle all of them:

1. **Default:** `border: 1px solid var(--accent-neutral)`, muted letter label (a/b/c/d), hover slides right `translateX(2px)` with border lightening
2. **Selected (before reveal):** `border-left: 3px solid var(--accent-brand)`, `background: var(--accent-brand-subtle)`, amber letter label
3. **Correct (after reveal):** `border: 1px solid var(--accent-correct)`, `background: var(--accent-correct-subtle)`, green letter label with ✓, brief glow pulse animation
4. **Wrong (selected, after reveal):** `border: 1px solid var(--accent-wrong)`, `background: var(--accent-wrong-subtle)`, red label with ✗, `shake` animation on reveal
5. **Correct (unselected, after reveal):** Show which was correct — green border, no tint background, no icon — subtly indicated so player learns

Letter labels (a/b/c/d): fixed `w-6` column, vertically centered, `text-xs font-mono`. Option text: full remaining width.

### Micro-interactions

- **Wrong answer:** `shake` keyframe — 3 small horizontal oscillations over 250ms, amplitude 4px
- **Correct answer glow:** brief `box-shadow` pulse in green, 400ms, fades out
- **Concept name reveal:** typewriter animation — each character appears with 35ms stagger delay
- **Progress dot transition:** active dot has slow scale pulse (1.0 → 1.2 → 1.0, 1.5s loop)
- **Answer hover:** `transform: translateX(2px)` + border color lightens, `transition: all 100ms ease`
- **Auto-advance between questions:** 1200ms pause after answer reveal, then question fades out and next fades in (opacity 0→1, 200ms)

### Code Snippet Component

- Background: `var(--bg-code)` — visually distinct from card surface
- Left accent border: `border-l-2 border-[var(--accent-brand)]`
- Language badge: top-right corner, `text-xs` mono, `color: var(--text-muted)`
- Padding: `p-4`, `rounded-sm` (4px — sharp, not pill)
- No line numbers by default (adds noise for 8-15 line snippets)

---

## Game State Machine

The puzzle session has exactly these states. Never add new states without updating this:

```
IDLE           → player hasn't started today's puzzle
QUESTION_1     → showing Q1, waiting for answer
QUESTION_2     → showing Q2, waiting for answer  
QUESTION_3     → showing Q3, waiting for answer
REVEALING      → brief transition (500ms) before reveal screen
REVEALED       → showing reveal screen with score, concept, citation
COMPLETED      → player has already done today's puzzle (show result only)
```

State transitions:
- IDLE → QUESTION_1: player clicks "Start"
- QUESTION_N → QUESTION_N+1: player selects an answer (auto-advance after 1200ms delay)
- QUESTION_3 → REVEALING: player selects answer
- REVEALING → REVEALED: after 500ms
- Any session start when already completed today → COMPLETED

---

## Data Flow

### How the Daily Puzzle Works
```typescript
// src/lib/puzzle.ts
function getPuzzleForDate(date: Date): Puzzle {
  const dayNumber = getDaysSinceEpoch(date); // deterministic
  const puzzles = getAllPuzzles();            // loads all JSON files
  const index = dayNumber % puzzles.length;  // wraps around
  return puzzles[index];
}
```

This means:
- Same puzzle for everyone on the same day (no server needed for puzzle selection)
- Puzzle IDs are their position in the sequence, not the day number
- The puzzle number shown in the share card IS the day number, not the puzzle ID

### localStorage Schema
```typescript
interface StoredGameState {
  date: string;                    // 'YYYY-MM-DD' — invalidate if date changes
  answers: (string | null)[];      // ['a', 'c', null] — null means not answered
  state: GameState;
  puzzleId: number;
}

const STORAGE_KEY = 'devdaily_game_state';
```

Always validate the stored date against today before using stored state.
If dates don't match, clear storage and start fresh.

---

## Content Rules (For Puzzle JSON Files)

Every puzzle JSON must have:
- Exactly 3 questions
- Q1 difficulty: 'easy'
- Q2 difficulty: 'medium'  
- Q3 difficulty: 'hard'
- Code snippets: 8-15 lines maximum — short enough to read in 10 seconds
- Wrong answer options: must be plausible — things a reasonable dev might think
- Concept name NEVER appears in any question text or options (that's the reveal)
- All code snippets use TypeScript unless the concept is language-agnostic (then use Python)
- `explanation` field on each option explains WHY it's right or wrong — written in plain English

---

## What NOT to Build (Common Deviations to Avoid)

**Do not add:**
- A timer/countdown on questions — adds anxiety, removes the learning mindset
- A points/XP system — streaks are enough gamification for now
- Leaderboards — not the right community dynamic for this product
- Multiple lives — one guess is the mechanic, this is intentional
- The ability to skip a question — commitment is the point
- User-generated content or puzzle submission — quality control nightmare
- Difficulty settings — everyone gets the same puzzle
- "Practice mode" before launch — scope creep, build it post-launch if needed
- Push notifications — ask for this permission only after user has played 3+ times
- Any ads or upsell during the puzzle session — never interrupt the 3 questions

**Do not change:**
- The 3-question structure
- The one-guess-per-question mechanic
- The concept-name-hidden-until-reveal pattern
- The dark-mode-default decision

---

## Auth and Database (Supabase)

Auth is **optional** — the game works completely without an account.

- LocalStorage handles game state for unregistered users
- Login unlocks: cross-device streak sync, full history, stats page
- Use Google OAuth only (not email/password — reduces friction)
- Never gate the actual puzzle behind auth — always playable without login

### Supabase Tables
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_played_date DATE
);

-- Game results
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  played_date DATE NOT NULL,
  puzzle_id INT NOT NULL,
  score INT NOT NULL,          -- 0, 1, 2, or 3
  answers JSONB NOT NULL,      -- {q1: 'a', q2: 'c', q3: 'b'}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, played_date) -- one result per user per day
);
```

Enable Row Level Security on both tables. Users can only read/write their own rows.

---

## Environment Variables

```bash
# .env.example (commit this)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SITE_URL=https://devdaily.dev

# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Code Quality Rules

- **No `any` type** — if you don't know the type, use `unknown` and narrow it
- **No non-null assertions (`!`)** unless you add a comment explaining why it's safe
- **No `console.log` in committed code** — use a proper logger or remove before committing
- **All async functions** must handle errors — no unhandled promise rejections
- **Components must be pure** where possible — lift state up, don't hide it inside components
- **No inline styles** — Tailwind classes only, CSS variables for theming
- Every component file exports **one default export** (the component) and named exports for types

---

## Current Build Phase

**Phase 1 — Content schema and sample data** ✅ COMPLETE

Tasks:
- [x] Define TypeScript types in `src/types/puzzle.ts`
- [x] Write sample puzzle JSON for Feature Envy (`content/puzzles/001-feature-envy.json`)
- [x] Write `src/lib/puzzle.ts` with `getPuzzleForDate()` and `getAllPuzzles()`
- [x] Write `src/lib/storage.ts` for localStorage read/write

**Phase 2 — UI components** ✅ COMPLETE

Pre-phase decisions made:
- **Wrong answer animation:** `shake` — 250ms, 4px amplitude, 3 oscillations (standard "no" gesture, dev-familiar from terminal auth prompts)
- **Q3 format:** Can be `which-one` OR `true-false` — not locked. Format is per-question in JSON. `QuestionCard` renders both.
- **Auto-advance delay:** 1200ms kept — right amount of time to register correct/wrong state before advancing

Components built:
- [x] `src/components/puzzle/CodeSnippet.tsx` — renders Shiki-highlighted HTML, amber left border
- [x] `src/components/puzzle/AnswerOption.tsx` — 5 states (default/selected/correct/wrong/correct-alt), shake + glow animations
- [x] `src/components/puzzle/QuestionCard.tsx` — handles multiple-choice and which-one formats
- [x] `src/components/puzzle/PuzzleSession.tsx` — full state machine, localStorage sync, auto-advance
- [x] `src/components/puzzle/RevealScreen.tsx` — typewriter concept name, rule of thumb block, citation
- [x] `src/components/ui/ShareCard.tsx` — copy-to-clipboard share text
- [x] `src/components/ui/ProgressDots.tsx` — 3-dot progress indicator with pulse animation
- [x] `src/components/ui/StreakCounter.tsx` — flame + number (hidden when streak = 0)
- [x] `src/components/layout/Header.tsx` — wordmark + day number + streak
- [x] `src/components/layout/Footer.tsx` — minimal devdaily.dev
- [x] `src/app/globals.css` — design tokens, animations, Shiki reset, @theme inline fonts
- [x] `src/app/layout.tsx` — JetBrains Mono + Instrument Serif via next/font/google
- [x] `src/app/page.tsx` — Server Component: loads puzzle, pre-renders Shiki HTML, mounts PuzzleSession
- [x] `src/app/api/puzzle/route.ts` — GET returns today's puzzle + day number
- [x] `src/lib/highlight.ts` — Shiki singleton (tokyo-night theme, server-only)
- [x] `src/lib/share.ts` — generateShareText() for copy card

---

## Questions to Answer Before Building Each Phase

Before Phase 2 (UI components):
- What exact animation should play when a user selects a wrong answer?
- Should Q3 always be "which one" format or can it vary?
- Does the auto-advance delay (1200ms) feel right or adjust it?

Before Phase 3 (game logic):
- Confirm the date-seeding approach works for timezone edge cases
- Decide: does the puzzle refresh at midnight UTC or midnight local time?

Before Phase 6 (auth):
- Decide: does streak count days you got 0/3, or only days you completed the puzzle?
- Decide: is there a "streak freeze" mechanic or hard reset on missed days?

---

## Known Gotchas & Technical Decisions

### Stack Versions (differ from what CLAUDE.md originally stated)
- **Next.js 16** is installed (not 14). The AGENTS.md header already flags breaking changes — always read `node_modules/next/dist/docs/` before writing Next.js-specific code.
- **Tailwind CSS v4** is installed. Configuration lives entirely in `src/app/globals.css` via `@theme inline { ... }` blocks — there is no `tailwind.config.ts`. Custom tokens (fonts, colors) are registered there, not in a config file.
- In Next.js 16 dynamic routes, `params` is a `Promise` — always `await params` before destructuring.

### `src/lib/puzzle.ts` — Server Only
Uses Node.js `fs` and `process.cwd()`. Never import this file in a Client Component — it will fail at runtime. Only call from Server Components or Route Handlers.

### Puzzle Ordering Is Append-Only
`getAllPuzzles()` sorts JSON files alphabetically and assigns puzzles to dates by `daysSinceEpoch % puzzles.length`. Inserting a new puzzle in the middle of the sequence shifts all subsequent puzzle assignments. Always append new puzzles (e.g., `002-...`, `003-...`) — never insert.

### Date Arithmetic Uses UTC
`getPuzzleForDate` uses `Date.UTC` for epoch calculation so puzzle resets happen at midnight UTC regardless of the player's timezone. Consistent with the midnight UTC reset rule in game mechanics.

### `getAllPuzzles()` Has No Cache
Reads and parses all files on every call. Acceptable for Phase 1 with a handful of puzzles. Add `React.cache()` or module-level memoization in Phase 3 before scaling up puzzle count.

---

## Commit Convention

```
feat: add RevealScreen component
fix: correct answer highlighting in AnswerOption
style: adjust code snippet padding
content: add puzzle 002 single-responsibility-principle
chore: update dependencies
```

Always commit after completing a discrete unit of work. Never commit broken code.
