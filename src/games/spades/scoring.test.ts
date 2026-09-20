import { describe, it, expect } from 'vitest';
import { applyBagPenalty, getTeam, scoreRound } from './scoring';

describe('Spades scoring', () => {
  it('getTeam pairs players sitting across the table', () => {
    expect(getTeam(0)).toBe('A');
    expect(getTeam(2)).toBe('A');
    expect(getTeam(1)).toBe('B');
    expect(getTeam(3)).toBe('B');
  });

  it('scoreRound awards 10 points per bid trick plus 1 per bag when the bid is made', () => {
    // Team A: players 0 & 2, bid 4 + 3 = 7, won 5 + 3 = 8 -> made it with 1 bag
    const bids = { 0: 4, 1: 2, 2: 3, 3: 2 };
    const tricksWonByPlayer = { 0: 5, 1: 2, 2: 3, 3: 3 };
    const scores = scoreRound(bids, tricksWonByPlayer);

    expect(scores.A.bid).toBe(7);
    expect(scores.A.tricksWon).toBe(8);
    expect(scores.A.bags).toBe(1);
    expect(scores.A.points).toBe(71); // 7*10 + 1
  });

  it('scoreRound penalizes a team that fails to make its bid', () => {
    // Team B: players 1 & 3, bid 2 + 2 = 4, won 2 + 1 = 3 -> set
    const bids = { 0: 4, 1: 2, 2: 3, 3: 2 };
    const tricksWonByPlayer = { 0: 5, 1: 2, 2: 3, 3: 1 };
    const scores = scoreRound(bids, tricksWonByPlayer);

    expect(scores.B.bid).toBe(4);
    expect(scores.B.tricksWon).toBe(3);
    expect(scores.B.bags).toBe(0);
    expect(scores.B.points).toBe(-40); // -4*10, set
  });

  it('applyBagPenalty carries bags forward with no penalty below 10', () => {
    const result = applyBagPenalty(3, 4);
    expect(result.bags).toBe(7);
    expect(result.penalty).toBe(0);
  });

  it('applyBagPenalty deducts 100 points and wraps the count when bags reach 10', () => {
    const result = applyBagPenalty(7, 5); // 12 total -> one penalty, 2 carried over
    expect(result.bags).toBe(2);
    expect(result.penalty).toBe(-100);
  });

  it('applyBagPenalty handles crossing the threshold multiple times at once', () => {
    const result = applyBagPenalty(8, 15); // 23 total -> two penalties, 3 carried over
    expect(result.bags).toBe(3);
    expect(result.penalty).toBe(-200);
  });
});
