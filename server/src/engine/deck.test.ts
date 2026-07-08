import { describe, expect, it } from 'vitest';
import {
  SINGLE_DECK_SIZE,
  buildDeck,
  buildShuffledDeck,
  requiredDeckCount,
  reshuffleDiscardIntoDrawPile,
  shuffle,
} from './deck.js';
import { pointValue, type Card } from './cards.js';

describe('buildDeck', () => {
  it('builds a standard 52-card deck plus 2 jokers', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(SINGLE_DECK_SIZE);
    expect(deck.filter((card) => card.rank === 'JOKER')).toHaveLength(2);
  });

  it('has 13 ranks across each of the 4 suits', () => {
    const deck = buildDeck();
    const standardCards = deck.filter((card) => card.rank !== 'JOKER');
    expect(standardCards).toHaveLength(52);
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      expect(standardCards.filter((card) => 'suit' in card && card.suit === suit)).toHaveLength(13);
    }
  });
});

describe('shuffle', () => {
  it('returns a permutation containing exactly the same cards', () => {
    const deck = buildDeck();
    const shuffled = shuffle(deck, () => 0.999999);

    expect(shuffled).toHaveLength(deck.length);
    expect(shuffled.map(pointValue).reduce((a, b) => a + b, 0)).toBe(
      deck.map(pointValue).reduce((a, b) => a + b, 0),
    );
  });

  it('is deterministic for a given random source', () => {
    const cards: Card[] = [
      { rank: 'A', suit: 'hearts' },
      { rank: '2', suit: 'hearts' },
      { rank: '3', suit: 'hearts' },
    ];

    // random() always returns 0 -> Fisher-Yates always swaps with index 0.
    const result = shuffle(cards, () => 0);

    expect(result).toEqual([
      { rank: '2', suit: 'hearts' },
      { rank: '3', suit: 'hearts' },
      { rank: 'A', suit: 'hearts' },
    ]);
  });

  it('does not mutate the input array', () => {
    const cards: Card[] = [
      { rank: 'A', suit: 'hearts' },
      { rank: '2', suit: 'hearts' },
    ];
    const original = [...cards];

    shuffle(cards, () => 0);

    expect(cards).toEqual(original);
  });
});

describe('requiredDeckCount', () => {
  it('uses a single deck when the draw pile stays large enough', () => {
    expect(requiredDeckCount(2, 5)).toBe(1);
    expect(requiredDeckCount(7, 5)).toBe(1);
  });

  it('scales to a second deck at the 8-player / hand-size-5 threshold from the spec', () => {
    // 8 * 5 = 40 dealt, 54 - 40 = 14 remaining, which is < 2*8 = 16.
    expect(requiredDeckCount(8, 5)).toBe(2);
  });

  it('treats an exact boundary match as still sufficient for one deck', () => {
    // 9 players, hand size 4: 36 dealt, 18 remaining, min draw pile 18 -> equal, one deck.
    expect(requiredDeckCount(9, 4)).toBe(1);
    // 10 players, hand size 4: 40 dealt, 14 remaining, min draw pile 20 -> short, two decks.
    expect(requiredDeckCount(10, 4)).toBe(2);
  });
});

describe('buildShuffledDeck', () => {
  it('builds one deck worth of cards below the scaling threshold', () => {
    expect(buildShuffledDeck(4, 5)).toHaveLength(SINGLE_DECK_SIZE);
  });

  it('builds two decks worth of cards at the scaling threshold', () => {
    expect(buildShuffledDeck(8, 5)).toHaveLength(SINGLE_DECK_SIZE * 2);
  });
});

describe('reshuffleDiscardIntoDrawPile', () => {
  it('keeps the current top card out of the new draw pile', () => {
    const discardPile: Card[] = [
      { rank: '4', suit: 'clubs' },
      { rank: '9', suit: 'diamonds' },
      { rank: 'K', suit: 'spades' }, // current top
    ];

    const { drawPile, topDiscard } = reshuffleDiscardIntoDrawPile(discardPile);

    expect(topDiscard).toEqual({ rank: 'K', suit: 'spades' });
    expect(drawPile).toHaveLength(2);
    expect(drawPile).not.toContainEqual({ rank: 'K', suit: 'spades' });
  });

  it('throws when the discard pile is empty', () => {
    expect(() => reshuffleDiscardIntoDrawPile([])).toThrow();
  });
});
