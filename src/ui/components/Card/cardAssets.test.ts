import { describe, it, expect } from 'vitest';
import { buildDeck } from '../../../engine/deck';
import type { Card } from '../../../engine/types';
import {
  CARD_IMAGES_AVAILABLE,
  cardBackPath,
  cardImagePath,
  cardLabel,
  cardShortLabel,
} from './cardAssets';

function card(suit: Card['suit'], rank: Card['rank']): Card {
  return { suit, rank, id: `${suit}-${rank}` };
}

describe('cardAssets (spec 001)', () => {
  it('AC-1: cardImagePath is /cards/${id}.svg for every card', () => {
    for (const c of buildDeck()) {
      expect(cardImagePath(c)).toBe(`/cards/${c.id}.svg`);
    }
  });

  it('AC-2: cardLabel names face and number cards', () => {
    expect(cardLabel(card('spades', 14))).toBe('Ace of Spades');
    expect(cardLabel(card('hearts', 11))).toBe('Jack of Hearts');
    expect(cardLabel(card('diamonds', 12))).toBe('Queen of Diamonds');
    expect(cardLabel(card('clubs', 13))).toBe('King of Clubs');
    expect(cardLabel(card('clubs', 10))).toBe('10 of Clubs');
    expect(cardLabel(card('hearts', 2))).toBe('2 of Hearts');
  });

  it('AC-3: cardShortLabel matches the old formatCard output', () => {
    const oldRankLabels: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const oldSuitSymbols = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
    for (const c of buildDeck()) {
      const expected = `${oldRankLabels[c.rank] ?? String(c.rank)}${oldSuitSymbols[c.suit]}`;
      expect(cardShortLabel(c)).toBe(expected);
    }
  });

  it('AC-4: every cardLabel is unique', () => {
    const labels = buildDeck().map(cardLabel);
    expect(new Set(labels).size).toBe(52);
  });

  it('cardImagePath and cardBackPath point at the dark set when asked', () => {
    expect(cardImagePath(card('hearts', 13), 'dark')).toBe('/cards/dark/hearts-13.svg');
    expect(cardBackPath('dark')).toBe('/cards/dark/back.svg');
  });

  it.skipIf(!CARD_IMAGES_AVAILABLE)('AC-10: every card image exists in public/, light and dark', () => {
    // Keys look like '/public/cards/spades-14.svg'.
    const files = new Set(Object.keys(import.meta.glob('/public/cards/**/*.svg')));
    for (const variant of ['light', 'dark'] as const) {
      const paths = [...buildDeck().map((c) => cardImagePath(c, variant)), cardBackPath(variant)];
      for (const path of paths) {
        expect(files.has(`/public${path}`), path).toBe(true);
      }
    }
    expect(files.size).toBe(106);
  });
});
