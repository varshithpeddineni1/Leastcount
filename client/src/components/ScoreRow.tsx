interface ScoreRowProps {
  name: string;
  score: number;
}

export function ScoreRow({ name, score }: ScoreRowProps) {
  return (
    <div className="score-row">
      <span className="score-row__name">{name}</span>
      <span className="score-row__score">{score}</span>
    </div>
  );
}
