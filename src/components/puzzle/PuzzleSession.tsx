'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameState, Puzzle } from '@/types/puzzle';
import { getUtcPuzzleDateKey } from '@/lib/daily-calendar';
import {
  getCurrentStreak,
  getStoredGameState,
  recordDailyCompletion,
  saveGameState,
} from '@/lib/storage';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProgressDots from '@/components/ui/ProgressDots';
import QuestionCard from './QuestionCard';
import RevealScreen from './RevealScreen';

interface Props {
  puzzle: Puzzle;
  dayNumber: number;
  highlightedSnippets: (string | null)[];
}

interface SessionState {
  phase: GameState;
  answers: (string | null)[];
  locked: boolean;
  fadingOut: boolean;
}

function todayString(): string {
  return getUtcPuzzleDateKey();
}

function getSecondsUntilNextUtcMidnight(): number {
  const now = new Date();
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
  );
  return Math.max(0, Math.floor((nextUtcMidnight - now.getTime()) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

const QUESTION_PHASES: GameState[] = ['QUESTION_1', 'QUESTION_2', 'QUESTION_3'];

export default function PuzzleSession({ puzzle, dayNumber, highlightedSnippets }: Props) {
  const [session, setSession] = useState<SessionState>({
    phase: 'IDLE',
    answers: [null, null, null],
    locked: false,
    fadingOut: false,
  });
  const [streak, setStreak] = useState(0);
  const [secondsToReset, setSecondsToReset] = useState<number | null>(null);

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const todayKey = todayString();
    setStreak(getCurrentStreak(todayKey));

    const stored = getStoredGameState();
    if (stored && stored.puzzleId === puzzle.id) {
      const phase: GameState =
        stored.state === 'REVEALING' ? 'REVEALED' : stored.state;
      setSession({ phase, answers: stored.answers, locked: false, fadingOut: false });

      if (stored.state === 'COMPLETED') {
        // Backfill streaks for already-completed days if the user refreshes.
        setStreak(recordDailyCompletion(todayKey));
      }
    }
  }, [puzzle.id]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  useEffect(() => {
    setSecondsToReset(getSecondsUntilNextUtcMidnight());

    const interval = setInterval(() => {
      setSecondsToReset(getSecondsUntilNextUtcMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentQuestionIndex = QUESTION_PHASES.indexOf(session.phase);

  function handleStart() {
    const answers: (string | null)[] = [null, null, null];
    setSession({ phase: 'QUESTION_1', answers, locked: false, fadingOut: false });
    saveGameState({
      date: todayString(),
      answers,
      state: 'QUESTION_1',
      puzzleId: puzzle.id,
    });
  }

  function handleAnswer(answerId: string) {
    if (session.locked || currentQuestionIndex === -1) return;

    const newAnswers = [...session.answers];
    newAnswers[currentQuestionIndex] = answerId;

    const nextPhase: GameState =
      currentQuestionIndex === 0
        ? 'QUESTION_2'
        : currentQuestionIndex === 1
          ? 'QUESTION_3'
          : 'REVEALING';

    setSession((prev) => ({ ...prev, answers: newAnswers, locked: true, fadingOut: false }));
    saveGameState({
      date: todayString(),
      answers: newAnswers,
      state: nextPhase,
      puzzleId: puzzle.id,
    });
  }

  function handleContinue() {
    const nextPhase: GameState =
      currentQuestionIndex === 0
        ? 'QUESTION_2'
        : currentQuestionIndex === 1
          ? 'QUESTION_3'
          : 'REVEALING';

    // Fade out the current question, then advance.
    setSession((prev) => ({ ...prev, fadingOut: true }));

    transitionTimer.current = setTimeout(() => {
      if (nextPhase === 'REVEALING') {
        setSession((prev) => ({ ...prev, phase: 'REVEALING', fadingOut: false, locked: false }));
        revealTimer.current = setTimeout(() => {
          const streakAfterComplete = recordDailyCompletion(todayString());
          setSession((prev) => ({ ...prev, phase: 'REVEALED' }));
          setStreak(streakAfterComplete);
          saveGameState({
            date: todayString(),
            answers: session.answers,
            state: 'COMPLETED',
            puzzleId: puzzle.id,
          });
        }, 500);
      } else {
        setSession({ phase: nextPhase, answers: session.answers, locked: false, fadingOut: false });
      }
    }, 200);
  }

  const showProgress =
    session.phase !== 'IDLE' &&
    session.phase !== 'REVEALING' &&
    session.phase !== 'REVEALED' &&
    session.phase !== 'COMPLETED';

  return (
    <div className="flex flex-col min-h-screen">
      <Header dayNumber={dayNumber} streak={streak} />

      {showProgress && (
        <ProgressDots
          phase={session.phase}
          answers={session.answers}
          puzzle={puzzle}
        />
      )}

      <main className="flex-1">
        {session.phase === 'IDLE' && (
          <div className="animate-fade-up px-4 max-w-[760px] mx-auto w-full">
            <div
              className="rounded-sm p-8 md:p-10"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="text-center mb-8">
                <p className="text-xs mb-3 tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  daily developer puzzle
                </p>
                <h1
                  className="text-[30px] leading-tight mb-3"
                  style={{
                    fontFamily: 'var(--font-instrument-serif)',
                    color: 'var(--accent-brand)',
                    fontStyle: 'italic',
                  }}
                >
                  One concept. Three questions.
                </h1>
                <p className="text-sm max-w-[520px] mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Spot the pattern, smell, or principle from real code situations. One guess per
                  question, then the concept gets revealed.
                </p>
              </div>

              <div className="text-center mb-9">
                <button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-sm text-sm transition-colors duration-150"
                  style={{
                    backgroundColor: 'var(--accent-brand)',
                    color: 'var(--bg-base)',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  Start today&apos;s puzzle
                </button>
                <p
                  className="text-xs mt-3 tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Resets in {secondsToReset === null ? '--:--:--' : formatCountdown(secondsToReset)}
                </p>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-sm p-3"
                style={{
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'color-mix(in oklab, var(--bg-surface) 80%, var(--bg-base) 20%)',
                }}
              >
                <div className="py-2 px-3 text-center sm:text-left">
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    format
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    3 questions
                  </p>
                </div>
                <div className="py-2 px-3 text-center sm:text-left">
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    attempts
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    One guess each
                  </p>
                </div>
                <div className="py-2 px-3 text-center sm:text-left">
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    current streak
                  </p>
                  <p className="text-sm tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {streak} day{streak === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentQuestionIndex >= 0 && (
          <QuestionCard
            key={currentQuestionIndex}
            question={puzzle.questions[currentQuestionIndex]}
            highlightedCode={highlightedSnippets[currentQuestionIndex]}
            selectedAnswer={session.answers[currentQuestionIndex]}
            locked={session.locked}
            fadingOut={session.fadingOut}
            puzzleId={puzzle.id}
            onAnswer={handleAnswer}
            onContinue={handleContinue}
          />
        )}

        {session.phase === 'REVEALING' && (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-2 h-2 rounded-full animate-dot-pulse"
              style={{ backgroundColor: 'var(--accent-brand)' }}
            />
          </div>
        )}

        {(session.phase === 'REVEALED' || session.phase === 'COMPLETED') && (
          <RevealScreen
            puzzle={puzzle}
            answers={session.answers}
            dayNumber={dayNumber}
            streak={streak}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
