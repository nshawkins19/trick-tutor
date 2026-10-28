import { describe, it, expect } from 'vitest';
import type { Card } from '../../engine/types';
import { explainLegalPlays } from './hints';

function card(suit: Card['suit'], rank: Card['rank']): Card {
  return { suit, rank, id: `${suit}-${rank}` };
}

const mixedHand = [card('spades', 14), card('hearts', 3)];
const allSpades = [card('spades', 2), card('spades', 9)];

describe('explainLegalPlays (spec 002, AC-14)', () => {
  it('leading, spades not broken, has non-spades', () => {
    expect(explainLegalPlays(mixedHand, null, false)).toMatch(/aren't broken yet/);
  });

  it('leading, spades not broken, only spades', () => {
    expect(explainLegalPlays(allSpades, null, false)).toMatch(/only have spades/);
  });

  it('leading, spades broken', () => {
    expect(explainLegalPlays(mixedHand, null, true)).toMatch(/play any card/);
  });

  it('following, has the lead suit', () => {
    expect(explainLegalPlays(mixedHand, 'hearts', false)).toBe('You must follow suit: play a ♥.');
  });

  it('following, void in the lead suit', () => {
    expect(explainLegalPlays(mixedHand, 'clubs', false)).toMatch(/out of ♣.*trump with a spade/);
  });
});
