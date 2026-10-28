import type { Card, Suit } from '../../engine/types';

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

/**
 * One sentence explaining which cards the human may play right now, and why.
 * Mirrors the branches of getLegalPlays so the explanation can't drift from
 * the rule it describes.
 */
export function explainLegalPlays(hand: Card[], leadSuit: Suit | null, spadesBroken: boolean): string {
  if (leadSuit === null) {
    if (spadesBroken) {
      return "You're leading — play any card.";
    }
    const onlySpades = hand.every((card) => card.suit === 'spades');
    return onlySpades
      ? "You only have spades left, so you may lead one even though spades aren't broken."
      : "Spades aren't broken yet, so lead any other suit.";
  }

  const symbol = SUIT_SYMBOLS[leadSuit];
  const canFollow = hand.some((card) => card.suit === leadSuit);
  if (canFollow) {
    return `You must follow suit: play a ${symbol}.`;
  }
  return leadSuit === 'spades'
    ? `You're out of ${symbol} — play any card.`
    : `You're out of ${symbol} — play anything, or trump with a spade.`;
}
