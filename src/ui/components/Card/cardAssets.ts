import type { Card, Suit } from '../../../engine/types';

/**
 * True while public/cards/ holds the 52 `${card.id}.svg` faces plus back.svg,
 * in both the light set and public/cards/dark/ (spec 001, AC-10). Set it to
 * false to fall back to CSS-drawn cards with no image requests.
 */
export const CARD_IMAGES_AVAILABLE = true;

/** Light cards by default; the dark set is used when the OS is in dark mode. */
export type CardImageVariant = 'light' | 'dark';

const VARIANT_DIRS: Record<CardImageVariant, string> = { light: '/cards', dark: '/cards/dark' };

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const SUIT_NAMES: Record<Suit, string> = {
  spades: 'Spades',
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
};

const FACE_RANK_LABELS: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const FACE_RANK_NAMES: Record<number, string> = { 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace' };

export function cardImagePath(card: Card, variant: CardImageVariant = 'light'): string {
  return `${VARIANT_DIRS[variant]}/${card.id}.svg`;
}

export function cardBackPath(variant: CardImageVariant = 'light'): string {
  return `${VARIANT_DIRS[variant]}/back.svg`;
}

export function suitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit];
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

/** 'A', 'K', '10', '2' */
export function rankLabel(card: Card): string {
  return FACE_RANK_LABELS[card.rank] ?? String(card.rank);
}

/** 'A♠' — compact form for logs and fallbacks. */
export function cardShortLabel(card: Card): string {
  return `${rankLabel(card)}${suitSymbol(card.suit)}`;
}

/** 'Ace of Spades' — used for alt text and aria-labels. */
export function cardLabel(card: Card): string {
  const rankName = FACE_RANK_NAMES[card.rank] ?? String(card.rank);
  return `${rankName} of ${SUIT_NAMES[card.suit]}`;
}
