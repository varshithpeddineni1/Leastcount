import type { Card, Rank, Suit } from './cards.js';

const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** Standard 52 cards plus 2 jokers (spec §1). */
export const SINGLE_DECK_SIZE = 54;

const MIN_DRAW_PILE_PER_PLAYER = 2;

export function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit });
    }
  }
  cards.push({ rank: 'JOKER' });
  cards.push({ rank: 'JOKER' });
  return cards;
}

export type RandomFn = () => number;

/** Fisher-Yates shuffle. Takes an injectable RNG so callers can get deterministic output. */
export function shuffle(cards: readonly Card[], random: RandomFn = Math.random): Card[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * A second deck is shuffled in when the draw pile after dealing would hold
 * fewer than 2 cards per player (spec §1).
 */
export function requiredDeckCount(players: number, handSize: number): 1 | 2 {
  const dealt = players * handSize;
  const remainingAfterDeal = SINGLE_DECK_SIZE - dealt;
  const minDrawPile = players * MIN_DRAW_PILE_PER_PLAYER;
  return remainingAfterDeal >= minDrawPile ? 1 : 2;
}

export function buildShuffledDeck(
  players: number,
  handSize: number,
  random: RandomFn = Math.random,
): Card[] {
  const deckCount = requiredDeckCount(players, handSize);
  const cards: Card[] = [];
  for (let i = 0; i < deckCount; i += 1) {
    cards.push(...buildDeck());
  }
  return shuffle(cards, random);
}

export interface ReshuffleResult {
  drawPile: Card[];
  topDiscard: Card;
}

/**
 * On draw-pile exhaustion, the discard pile (minus its current top card) is
 * reshuffled into a new draw pile (spec §3). `discardPile`'s last element is
 * the current top card.
 */
export function reshuffleDiscardIntoDrawPile(
  discardPile: readonly Card[],
  random: RandomFn = Math.random,
): ReshuffleResult {
  if (discardPile.length === 0) {
    throw new Error('Cannot reshuffle an empty discard pile');
  }
  const topDiscard = discardPile[discardPile.length - 1]!;
  const rest = discardPile.slice(0, -1);
  return {
    drawPile: shuffle(rest, random),
    topDiscard,
  };
}
