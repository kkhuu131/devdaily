'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameState, Puzzle } from '@/types/puzzle';
import { getStoredGameState, saveGameState } from '@/lib/storage';
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
}

function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const QUESTION_PHASES: GameState[] = ['QUESTION_1', 'QUESTION_2', 'QUESTION_3'];

export default function PuzzleSession({ puzzle, dayNumber, highlightedSnippets }: Props) {
  const [session, setSession] = useState<SessionState>({
    phase: 'IDLE',
    answers: [null, null, null],
    locked: false,
  });

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = getStoredGameState();
    if (stored && stored.puzzleId === puzzle.id) {
      const phase: GameState =
        stored.state === 'REVEALING' ? 'REVEALED' : stored.state;
      setSession({ phase, answers: stored.answers, locked: false });
    }
  }, [puzzle.id]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  const currentQuestionIndex = QUESTION_PHASES.indexOf(session.phase);

  function handleStart() {
    const answers: (string | null)[] = [null, null, null];
    setSession({ phase: 'QUESTION_1', answers, locked: false });
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

    setSession((prev) => ({ ...prev, answers: newAnswers, locked: true }));
    saveGameState({
      date: todayString(),
      answers: newAnswers,
      state: nextPhase,
      puzzleId: puzzle.id,
    });

    advanceTimer.current = setTimeout(() => {
      if (nextPhase === 'REVEALING') {
        setSession((prev) => ({ ...prev, phase: 'REVEALING', locked: false }));
        revealTimer.current = setTimeout(() => {
          setSession((prev) => ({ ...prev, phase: 'REVEALED' }));
          saveGameState({
            date: todayString(),
            answers: newAnswers,
            state: 'COMPLETED',
            puzzleId: puzzle.id,
          });
        }, 500);
      } else {
        setSession((prev) => ({ ...prev, phase: nextPhase, locked: false }));
      }
    }, 1200);
  }

  const showProgress =
    session.phase !== 'IDLE' &&
    session.phase !== 'REVEALING' &&
    session.phase !== 'REVEALED' &&
    session.phase !== 'COMPLETED';

  return (
    <div className="flex flex-col min-h-screen">
      <Header dayNumber={dayNumber} streak={0} />

      {showProgress && (
        <ProgressDots
          phase={session.phase}
          answers={session.answers}
          puzzle={puzzle}
        />
      )}

      <main className="flex-1">
        {session.phase === 'IDLE' && (
          <div className="animate-fade-up px-4 max-w-[640px] mx-auto w-full">
            <div
              className="rounded-sm p-8 text-center"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                3 questions · one concept · daily
              </p>
              <button
                onClick={handleStart}
                className="px-8 py-3 rounded-sm text-sm transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--accent-brand)',
                  color: 'var(--bg-base)',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.88';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Start today&apos;s puzzle
              </button>
            </div>
          </div>
        )}

        {currentQuestionIndex >= 0 && (
          <QuestionCard
            question={puzzle.questions[currentQuestionIndex]}
            highlightedCode={highlightedSnippets[currentQuestionIndex]}
            selectedAnswer={session.answers[currentQuestionIndex]}
            locked={session.locked}
            onAnswer={handleAnswer}
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
