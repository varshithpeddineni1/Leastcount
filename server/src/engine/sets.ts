import type { Card } from './cards.js';

function rankKey(card: Card): string {
  return card.rank;
}

/**
 * A legal discard is a single card, or two-or-more cards of the same rank
 * (spec §3A.1). Mixed-rank groups are rejected.
 */
export function isLegalDiscard(cards: readonly Card[]): boolean {
  const [first, ...rest] = cards;
  if (!first) {
    return false;
  }
  return rest.every((card) => rankKey(card) === rankKey(first));
}
