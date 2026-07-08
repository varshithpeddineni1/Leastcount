import { describe, expect, it } from 'vitest';
import { handTotal, pointValue, type Card } from './cards.js';

describe('pointValue', () => {
  it.each<[Card, number]>([
    [{ rank: 'A', suit: 'hearts' }, 1],
    [{ rank: '2', suit: 'hearts' }, 2],
    [{ rank: '3', suit: 'hearts' }, 3],
    [{ rank: '4', suit: 'hearts' }, 4],
    [{ rank: '5', suit: 'hearts' }, 5],
    [{ rank: '6', suit: 'hearts' }, 6],
    [{ rank: '7', suit: 'hearts' }, 7],
    [{ rank: '8', suit: 'hearts' }, 8],
    [{ rank: '9', suit: 'hearts' }, 9],
    [{ rank: '10', suit: 'hearts' }, 10],
    [{ rank: 'J', suit: 'hearts' }, 10],
    [{ rank: 'Q', suit: 'hearts' }, 10],
    [{ rank: 'K', suit: 'hearts' }, 10],
    [{ rank: 'JOKER' }, 0],
  ])('scores %o as %i', (card, expected) => {
    expect(pointValue(card)).toBe(expected);
  });

  it('is independent of suit', () => {
    expect(pointValue({ rank: 'K', suit: 'spades' })).toBe(
      pointValue({ rank: 'K', suit: 'clubs' }),
    );
  });
});

describe('handTotal', () => {
  it('sums the point values of every card in the hand', () => {
    const hand: Card[] = [
      { rank: 'K', suit: 'hearts' },
      { rank: '5', suit: 'clubs' },
      { rank: 'JOKER' },
      { rank: 'A', suit: 'spades' },
    ];

    expect(handTotal(hand)).toBe(10 + 5 + 0 + 1);
  });

  it('returns 0 for an empty hand', () => {
    expect(handTotal([])).toBe(0);
  });
});
