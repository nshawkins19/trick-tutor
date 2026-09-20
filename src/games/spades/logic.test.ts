import { describe, it, expect } from 'vitest';
import type { Card, TrickPlay } from '../../engine/types';
import { chooseCardToPlay, evaluateTrick } from './logic';

function card(suit: Card['suit'], rank: Card['rank']): Card {
  return { suit, rank, id: `${suit}-${rank}` };
}

describe('Spades logic', () => {
  it('evaluateTrick: highest card of lead suit wins when no spades played', () => {
    // All hearts, player 3 played the highest heart (A)
    const plays: TrickPlay[] = [
      { playerId: 0, card: { suit: 'hearts', rank: 5, id: 'hearts-5' } },
      { playerId: 1, card: { suit: 'hearts', rank: 9, id: 'hearts-9' } },
      { playerId: 2, card: { suit: 'hearts', rank: 10, id: 'hearts-10' } },
      { playerId: 3, card: { suit: 'hearts', rank: 14, id: 'hearts-14' } },
    ];
    expect(evaluateTrick(plays)).toBe(3);
  });

  it('evaluateTrick: highest spade wins even if lower than lead suit cards', () => {
    // Player 2 played 7 of spades (trump) — beats higher hearts
    const plays: TrickPlay[] = [
      { playerId: 0, card: { suit: 'hearts', rank: 14, id: 'hearts-14' } }, // Ace of hearts
      { playerId: 1, card: { suit: 'hearts', rank: 13, id: 'hearts-13' } }, // King of hearts
      { playerId: 2, card: { suit: 'spades', rank: 7, id: 'spades-7' } },  // 7 of spades (trump)
      { playerId: 3, card: { suit: 'hearts', rank: 12, id: 'hearts-12' } }, // Queen of hearts
    ];
    expect(evaluateTrick(plays)).toBe(2);
  });

  it('evaluateTrick: highest spade wins when multiple spades played', () => {
    // Multiple spades; player 1 has the highest (K)
    const plays: TrickPlay[] = [
      { playerId: 0, card: { suit: 'spades', rank: 5, id: 'spades-5' } },
      { playerId: 1, card: { suit: 'spades', rank: 13, id: 'spades-13' } }, // King of spades
      { playerId: 2, card: { suit: 'spades', rank: 10, id: 'spades-10' } },
      { playerId: 3, card: { suit: 'clubs', rank: 14, id: 'clubs-14' } },   // Ace of clubs (doesn't matter)
    ];
    expect(evaluateTrick(plays)).toBe(1);
  });

  // Still needs tricks to make its bid (tricksWonSoFar < bid)
  const stillBidding = { bid: 3, tricksWonSoFar: 0 };
  // Already made its bid (tricksWonSoFar >= bid) — extra tricks are just bags
  const bidAlreadyMade = { bid: 2, tricksWonSoFar: 2 };

  it('chooseCardToPlay leads with the highest non-spade card, saving spades', () => {
    const hand = [card('spades', 14), card('hearts', 9), card('clubs', 4)];
    expect(chooseCardToPlay(hand, null, [], stillBidding)).toEqual(card('hearts', 9));
  });

  it('chooseCardToPlay leads with the highest spade when that is all it has', () => {
    const hand = [card('spades', 5), card('spades', 10)];
    expect(chooseCardToPlay(hand, null, [], stillBidding)).toEqual(card('spades', 10));
  });

  it('chooseCardToPlay wins as cheaply as possible when it can', () => {
    // Lead was hearts-9; hand has two hearts that beat it — should pick the lower one
    const hand = [card('hearts', 10), card('hearts', 13), card('clubs', 2)];
    const currentPlays: TrickPlay[] = [{ playerId: 0, card: card('hearts', 9) }];
    expect(chooseCardToPlay(hand, 'hearts', currentPlays, stillBidding)).toEqual(card('hearts', 10));
  });

  it('chooseCardToPlay trumps in when it cannot follow suit and a spade would win', () => {
    const hand = [card('spades', 3), card('clubs', 2)];
    const currentPlays: TrickPlay[] = [{ playerId: 0, card: card('hearts', 9) }];
    expect(chooseCardToPlay(hand, 'hearts', currentPlays, stillBidding)).toEqual(card('spades', 3));
  });

  it('chooseCardToPlay ducks with its lowest card when it cannot win', () => {
    // Can't beat the King of hearts already played; should throw away the lowest card
    const hand = [card('hearts', 4), card('hearts', 8)];
    const currentPlays: TrickPlay[] = [{ playerId: 0, card: card('hearts', 13) }];
    expect(chooseCardToPlay(hand, 'hearts', currentPlays, stillBidding)).toEqual(card('hearts', 4));
  });

  it('chooseCardToPlay leads with its lowest card once the bid is already made', () => {
    const hand = [card('hearts', 9), card('clubs', 4), card('diamonds', 12)];
    expect(chooseCardToPlay(hand, null, [], bidAlreadyMade)).toEqual(card('clubs', 4));
  });

  it('chooseCardToPlay dumps its highest losing card rather than win once bid is made', () => {
    // Could win with hearts-13, but bid is already made — should shed the highest
    // heart that still loses (hearts-6) instead of taking the trick with hearts-13
    const hand = [card('hearts', 2), card('hearts', 6), card('hearts', 13)];
    const currentPlays: TrickPlay[] = [{ playerId: 0, card: card('hearts', 8) }];
    expect(chooseCardToPlay(hand, 'hearts', currentPlays, bidAlreadyMade)).toEqual(card('hearts', 6));
  });

  it('chooseCardToPlay wins as cheaply as possible when forced to, even with bid already made', () => {
    // Must follow hearts, and both hearts in hand beat the lead — no way to avoid winning
    const hand = [card('hearts', 10), card('hearts', 13)];
    const currentPlays: TrickPlay[] = [{ playerId: 0, card: card('hearts', 9) }];
    expect(chooseCardToPlay(hand, 'hearts', currentPlays, bidAlreadyMade)).toEqual(card('hearts', 10));
  });
});
