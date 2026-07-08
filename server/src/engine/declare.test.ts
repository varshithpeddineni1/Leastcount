import { describe, expect, it } from 'vitest';
import { resolveDeclare, type PlayerHandTotal } from './declare.js';

const WRONG_DECLARE_PENALTY = 40;

describe('resolveDeclare', () => {
  it('scores a correct declare: declarer 0, everyone else their own total', () => {
    const hands: PlayerHandTotal[] = [
      { playerId: 'a', handTotal: 2 },
      { playerId: 'b', handTotal: 15 },
      { playerId: 'c', handTotal: 9 },
    ];

    const outcomes = resolveDeclare('a', hands, WRONG_DECLARE_PENALTY);

    expect(outcomes).toEqual([
      { playerId: 'a', handTotal: 2, delta: 0, result: 'declarer_correct' },
      { playerId: 'b', handTotal: 15, delta: 15, result: 'other' },
      { playerId: 'c', handTotal: 9, delta: 9, result: 'other' },
    ]);
  });

  it('penalizes a wrong declare when another player is strictly lower', () => {
    const hands: PlayerHandTotal[] = [
      { playerId: 'a', handTotal: 10 },
      { playerId: 'b', handTotal: 3 },
      { playerId: 'c', handTotal: 20 },
    ];

    const outcomes = resolveDeclare('a', hands, WRONG_DECLARE_PENALTY);

    expect(outcomes).toEqual([
      { playerId: 'a', handTotal: 10, delta: 40, result: 'declarer_wrong' },
      { playerId: 'b', handTotal: 3, delta: 0, result: 'lowest' },
      { playerId: 'c', handTotal: 20, delta: 20, result: 'other' },
    ]);
  });

  it('counts a tie against the declarer as a wrong declare', () => {
    const hands: PlayerHandTotal[] = [
      { playerId: 'a', handTotal: 5 },
      { playerId: 'b', handTotal: 5 },
      { playerId: 'c', handTotal: 12 },
    ];

    const outcomes = resolveDeclare('a', hands, WRONG_DECLARE_PENALTY);

    expect(outcomes).toEqual([
      { playerId: 'a', handTotal: 5, delta: 40, result: 'declarer_wrong' },
      { playerId: 'b', handTotal: 5, delta: 0, result: 'lowest' },
      { playerId: 'c', handTotal: 12, delta: 12, result: 'other' },
    ]);
  });

  it('scores every tied-lowest non-declarer as 0 on a wrong declare', () => {
    const hands: PlayerHandTotal[] = [
      { playerId: 'a', handTotal: 8 },
      { playerId: 'b', handTotal: 3 },
      { playerId: 'c', handTotal: 3 },
    ];

    const outcomes = resolveDeclare('a', hands, WRONG_DECLARE_PENALTY);

    expect(outcomes).toEqual([
      { playerId: 'a', handTotal: 8, delta: 40, result: 'declarer_wrong' },
      { playerId: 'b', handTotal: 3, delta: 0, result: 'lowest' },
      { playerId: 'c', handTotal: 3, delta: 0, result: 'lowest' },
    ]);
  });

  it('throws if the declarer is not among the hands', () => {
    const hands: PlayerHandTotal[] = [{ playerId: 'b', handTotal: 3 }];

    expect(() => resolveDeclare('a', hands, WRONG_DECLARE_PENALTY)).toThrow();
  });
});
