import { describe, expect, it } from 'vitest';
import { isLegalDiscard } from './sets.js';
import type { Card } from './cards.js';

describe('isLegalDiscard', () => {
  it('accepts a single card', () => {
    const cards: Card[] = [{ rank: '7', suit: 'hearts' }];
    expect(isLegalDiscard(cards)).toBe(true);
  });

  it('accepts a same-rank set of two or more cards', () => {
    const cards: Card[] = [
      { rank: '7', suit: 'hearts' },
      { rank: '7', suit: 'clubs' },
      { rank: '7', suit: 'spades' },
    ];
    expect(isLegalDiscard(cards)).toBe(true);
  });

  it('accepts multiple jokers as a same-rank set', () => {
    const cards: Card[] = [{ rank: 'JOKER' }, { rank: 'JOKER' }];
    expect(isLegalDiscard(cards)).toBe(true);
  });

  it('rejects a mixed-rank discard', () => {
    const cards: Card[] = [
      { rank: '7', suit: 'hearts' },
      { rank: '8', suit: 'clubs' },
    ];
    expect(isLegalDiscard(cards)).toBe(false);
  });

  it('rejects an empty discard', () => {
    expect(isLegalDiscard([])).toBe(false);
  });
});
