export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface StandardCard {
  rank: Rank;
  suit: Suit;
}

export interface JokerCard {
  rank: 'JOKER';
}

export type Card = StandardCard | JokerCard;

const FACE_VALUES: Record<Rank, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 10,
  Q: 10,
  K: 10,
};

/** Ace = 1, 2-10 = face value, J/Q/K = 10, Joker = 0 (spec §1). */
export function pointValue(card: Card): number {
  if (card.rank === 'JOKER') {
    return 0;
  }
  return FACE_VALUES[card.rank];
}

export function handTotal(cards: readonly Card[]): number {
  return cards.reduce((total, card) => total + pointValue(card), 0);
}
