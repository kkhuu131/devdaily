import { NextResponse } from 'next/server';
import { getPuzzleForDate, getDayNumber } from '@/lib/puzzle';

export const dynamic = 'force-dynamic';

export async function GET() {
  const today = new Date();
  const puzzle = getPuzzleForDate(today);
  const dayNumber = getDayNumber(today);
  return NextResponse.json({ puzzle, dayNumber });
}
