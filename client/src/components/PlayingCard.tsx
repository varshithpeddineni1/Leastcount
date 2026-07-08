export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const RED_SUITS: ReadonlySet<Suit> = new Set(['hearts', 'diamonds']);

export type PlayingCardProps =
  { variant: 'face'; rank: string; suit: Suit } | { variant: 'back' } | { variant: 'joker' };

export function PlayingCard(props: PlayingCardProps) {
  if (props.variant === 'back') {
    return <div className="playing-card playing-card--back" aria-label="Face-down card" />;
  }

  if (props.variant === 'joker') {
    return (
      <div className="playing-card playing-card--joker" aria-label="Joker">
        JOKER
      </div>
    );
  }

  const colorClass = RED_SUITS.has(props.suit) ? 'playing-card--red' : 'playing-card--black';
  return (
    <div
      className={`playing-card playing-card--face ${colorClass}`}
      aria-label={`${props.rank} of ${props.suit}`}
    >
      <span>{props.rank}</span>
      <span>{SUIT_SYMBOL[props.suit]}</span>
    </div>
  );
}
