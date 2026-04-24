'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameState, Puzzle } from '@/types/puzzle';
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

interface StoredArchiveState {
  phase: GameState;
  answers: (string | null)[];
}

interface InitialArchiveState {
  session: SessionState;
}

const QUESTION_PHASES: GameState[] = ['QUESTION_1', 'QUESTION_2', 'QUESTION_3'];

function storageKey(puzzleId: number): string {
  return `devdaily_archive_${puzzleId}`;
}

function loadArchiveState(puzzleId: number): StoredArchiveState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(puzzleId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredArchiveState;
  } catch {
    return null;
  }
}

function saveArchiveState(puzzleId: number, phase: GameState, answers: (string | null)[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(puzzleId), JSON.stringify({ phase, answers }));
  } catch {
    // ignore quota errors
  }
}

function getInitialArchiveState(puzzleId: number): InitialArchiveState {
  const emptySession: SessionState = {
    phase: 'IDLE',
    answers: [null, null, null],
    locked: false,
    fadingOut: false,
  };

  const stored = loadArchiveState(puzzleId);
  if (!stored) return { session: emptySession };

  const phase: GameState = stored.phase === 'REVEALING' ? 'REVEALED' : stored.phase;
  return {
    session: { phase, answers: stored.answers, locked: false, fadingOut: false },
  };
}

export default function ArchiveSession({ puzzle, dayNumber, highlightedSnippets }: Props) {
  const [initialArchiveState] = useState<InitialArchiveState>(() => getInitialArchiveState(puzzle.id));
  const [session, setSession] = useState<SessionState>(initialArchiveState.session);

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  const currentQuestionIndex = QUESTION_PHASES.indexOf(session.phase);

  function handleStart() {
    const answers: (string | null)[] = [null, null, null];
    setSession({ phase: 'QUESTION_1', answers, locked: false, fadingOut: false });
    saveArchiveState(puzzle.id, 'QUESTION_1', answers);
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
    saveArchiveState(puzzle.id, nextPhase, newAnswers);
  }

  function handleContinue() {
    const nextPhase: GameState =
      currentQuestionIndex === 0
        ? 'QUESTION_2'
        : currentQuestionIndex === 1
          ? 'QUESTION_3'
          : 'REVEALING';

    setSession((prev) => ({ ...prev, fadingOut: true }));

    transitionTimer.current = setTimeout(() => {
      if (nextPhase === 'REVEALING') {
        setSession((prev) => ({ ...prev, phase: 'REVEALING', fadingOut: false, locked: false }));
        revealTimer.current = setTimeout(() => {
          setSession((prev) => ({ ...prev, phase: 'REVEALED' }));
          saveArchiveState(puzzle.id, 'COMPLETED', session.answers);
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
      <Header dayNumber={dayNumber} streak={0} />

      <div className="px-4 pb-2 max-w-[760px] mx-auto w-full">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          archive · #{dayNumber}
        </p>
      </div>

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
              className="rounded-sm p-6 sm:p-8 text-center"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                3 questions · one concept · no streak stakes
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-3 min-h-11 rounded-sm text-sm transition-opacity duration-150"
                style={{
                  backgroundColor: 'var(--accent-brand)',
                  color: 'var(--bg-base)',
                  border: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Start puzzle
              </button>
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
            streak={0}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
