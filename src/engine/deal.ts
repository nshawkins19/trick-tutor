import type { Card, PlayerId, Round, Trick } from './types';

export function dealHands(deck: Card[]): Record<PlayerId, Card[]> {
  const hands: Record<PlayerId, Card[]> = { 0: [], 1: [], 2: [], 3: [] };

  for (let i = 0; i < deck.length; i++) {
    const playerId: PlayerId = (i % 4) as PlayerId;
    hands[playerId].push(deck[i]);
  }

  return hands;
}

export function initializeRound<TBid>(dealerId: PlayerId, deck: Card[]): Round<TBid> {
  const hands = dealHands(deck);
  dealerId = (dealerId % 4) as PlayerId; // Ensure dealerId is valid
  const currentTrick: Trick = {
    leadSuit: null,
    plays: [],
    winnerId: null,
  };

  return {
    dealerId,
    hands,
    bids: {},
    tricks: [],
    currentTrick,
  };
}
