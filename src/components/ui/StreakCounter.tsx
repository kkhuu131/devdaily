interface Props {
  streak: number;
}

export default function StreakCounter({ streak }: Props) {
  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
      <span>🔥</span>
      <span className="tabular-nums">{streak}</span>
    </div>
  );
}
