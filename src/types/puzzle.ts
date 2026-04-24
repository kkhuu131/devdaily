export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'code-smell' | 'solid' | 'design-pattern' | 'principle' | 'refactoring';
export type QuestionFormat = 'multiple-choice' | 'which-one' | 'true-false';

export interface AnswerOption {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Question {
  id: 1 | 2 | 3;
  format: QuestionFormat;
  difficulty: Difficulty;
  prompt: string;
  codeSnippet?: string;
  language?: string;
  options: AnswerOption[];
}

export interface PuzzleCitation {
  author: string;
  bookTitle: string;
  chapter: string;
  page?: string;
  externalUrl: string;
}

export interface Puzzle {
  id: number;
  conceptName: string;
  category: Category;
  definition: string;
  ruleOfThumb: string;
  citation: PuzzleCitation;
  questions: [Question, Question, Question];
}

export type GameState =
  | 'IDLE'
  | 'QUESTION_1'
  | 'QUESTION_2'
  | 'QUESTION_3'
  | 'REVEALING'
  | 'REVEALED'
  | 'COMPLETED';

export interface StoredGameState {
  date: string;
  answers: (string | null)[];
  state: GameState;
  puzzleId: number;
}

export interface StreakState {
  current: number;
  lastCompletedDate: string | null;
}
