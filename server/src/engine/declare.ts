export interface PlayerHandTotal {
  playerId: string;
  handTotal: number;
}

export type DeclareResultTag = 'declarer_correct' | 'declarer_wrong' | 'lowest' | 'other';

export interface DeclareOutcome {
  playerId: string;
  handTotal: number;
  delta: number;
  result: DeclareResultTag;
}

/**
 * Resolves a declare ("show") per spec §4.
 *
 * Correct declare: the declarer is strictly lowest -> declarer scores 0,
 * everyone else scores their own hand total.
 *
 * Wrong declare (a tie counts against the declarer): the declarer scores
 * `wrongDeclarePenalty`; every player who actually holds the lowest total
 * scores 0; everyone else scores their own hand total.
 */
export function resolveDeclare(
  declarerId: string,
  hands: readonly PlayerHandTotal[],
  wrongDeclarePenalty: number,
): DeclareOutcome[] {
  const declarer = hands.find((hand) => hand.playerId === declarerId);
  if (!declarer) {
    throw new Error(`Declarer "${declarerId}" is not among the hands provided`);
  }

  const lowest = Math.min(...hands.map((hand) => hand.handTotal));
  const others = hands.filter((hand) => hand.playerId !== declarerId);
  const declarerIsStrictlyLowest = others.every((hand) => declarer.handTotal < hand.handTotal);

  if (declarerIsStrictlyLowest) {
    return hands.map((hand): DeclareOutcome => ({
      playerId: hand.playerId,
      handTotal: hand.handTotal,
      delta: hand.playerId === declarerId ? 0 : hand.handTotal,
      result: hand.playerId === declarerId ? 'declarer_correct' : 'other',
    }));
  }

  return hands.map((hand): DeclareOutcome => {
    if (hand.playerId === declarerId) {
      return {
        playerId: hand.playerId,
        handTotal: hand.handTotal,
        delta: wrongDeclarePenalty,
        result: 'declarer_wrong',
      };
    }
    if (hand.handTotal === lowest) {
      return { playerId: hand.playerId, handTotal: hand.handTotal, delta: 0, result: 'lowest' };
    }
    return {
      playerId: hand.playerId,
      handTotal: hand.handTotal,
      delta: hand.handTotal,
      result: 'other',
    };
  });
}
