import type { Card, PlayerId } from '../../engine/types';

/**
 * Estimate how many tricks a hand is likely to win.
 *
 * Simple point-count heuristic (not a strategic AI, just a starting point):
 * - Each Ace is nearly a guaranteed trick
 * - Each King usually wins a trick
 * - The Queen of Spades often wins a trick, since spades are trump
 * - Extra spades beyond a typical hand's share (3) let you "ruff" — ceding
 *   the trick's suit and trumping in — so each one adds to the estimate
 */
export function estimateBid(hand: Card[]): number {
  let estimate = 0;

  for (const card of hand) {
    if (card.rank === 14) {
      estimate += 1; // Ace
    } else if (card.rank === 13) {
      estimate += 1; // King
    } else if (card.suit === 'spades' && card.rank === 12) {
      estimate += 1; // Queen of Spades
    }
  }

  const spadesCount = hand.filter((card) => card.suit === 'spades').length;
  const extraSpades = Math.max(0, spadesCount - 3);
  estimate += extraSpades;

  return Math.min(estimate, hand.length);
}

/**
 * Collect a bid from every player, in bidding order (starting left of dealer).
 */
export function collectBids(
  hands: Record<PlayerId, Card[]>,
  dealerId: PlayerId
): Record<PlayerId, number> {
  const bids: Record<PlayerId, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let playerId = ((dealerId + 1) % 4) as PlayerId;

  for (let i = 0; i < 4; i++) {
    bids[playerId] = estimateBid(hands[playerId]);
    playerId = ((playerId + 1) % 4) as PlayerId;
  }

  return bids;
}
