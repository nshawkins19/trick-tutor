import type { Card, PlayerId, Suit, TrickPlay } from '../../engine/types';

/**
 * Find the currently-winning play within a trick, whether it's complete
 * (4 plays) or still in progress (1-3 plays so far).
 *
 * Rules:
 * - Spades are always trump
 * - The lead suit is the suit of the first card played
 * - The highest card of the lead suit wins, unless a spade was played
 * - If a spade was played, the highest spade wins (regardless of lead suit)
 */
function currentWinningPlay(plays: TrickPlay[]): TrickPlay {
  const leadSuit = plays[0].card.suit;
  const contenders = plays.filter(
    (play) => play.card.suit === leadSuit || play.card.suit === 'spades'
  );
  const anySpadesPlayed = contenders.some((play) => play.card.suit === 'spades');
  const relevant = anySpadesPlayed
    ? contenders.filter((play) => play.card.suit === 'spades')
    : contenders;

  return relevant.reduce((best, play) => (play.card.rank > best.card.rank ? play : best));
}

/** Determine which player wins a completed (4-play) trick. */
export function evaluateTrick(plays: TrickPlay[]): PlayerId {
  if (plays.length !== 4) {
    throw new Error(`evaluateTrick expects exactly 4 plays, got ${plays.length}`);
  }

  return currentWinningPlay(plays).playerId;
}

/**
 * Determine which cards from a hand are legal to play.
 * You must follow the lead suit if you have a card of that suit;
 * otherwise any card (including spades) is legal.
 * A null leadSuit means this play is leading the trick — any card is legal.
 */
export function getLegalPlays(hand: Card[], leadSuit: Suit | null): Card[] {
  if (leadSuit === null) {
    return hand;
  }
  const followSuit = hand.filter((card) => card.suit === leadSuit);
  return followSuit.length > 0 ? followSuit : hand;
}

/** Would `candidate` beat the trick's current best card if played next? */
function beats(candidate: Card, currentBest: Card, leadSuit: Suit): boolean {
  const candidateIsTrump = candidate.suit === 'spades';
  const bestIsTrump = currentBest.suit === 'spades';

  if (candidateIsTrump !== bestIsTrump) {
    return candidateIsTrump;
  }
  if (candidateIsTrump) {
    return candidate.rank > currentBest.rank;
  }
  return candidate.suit === leadSuit && candidate.rank > currentBest.rank;
}

export interface BidContext {
  bid: number;
  tricksWonSoFar: number;
}

/**
 * Choose a card to play. The strategy flips depending on whether this
 * player still needs tricks to make their bid:
 *
 * Still needs tricks (tricksWonSoFar < bid):
 * - Leading: play the highest non-spade card available (spades are saved
 *   for when they're needed to win), or the highest spade if that's all
 *   that's left
 * - Following, and able to win: play the lowest legal card that still wins
 *   — no need to spend an Ace when a 9 would do
 * - Following, and unable to win: play the lowest legal card, conserving
 *   stronger cards for a trick that's actually winnable
 *
 * Bid already made (tricksWonSoFar >= bid) — extra tricks are just bags,
 * so the goal flips to avoiding wins:
 * - Leading: play the lowest card, minimizing the chance of accidentally
 *   winning
 * - Following, and can avoid winning: play the highest losing card —
 *   shed dangerous high cards now, while it's safe to do so
 * - Following, but every legal card would win: no choice — win as cheaply
 *   as possible, same as the "still needs tricks" case
 *
 * This doesn't handle Nil bids specially (a Nil bidder here just behaves
 * like someone who has already made a bid of 0).
 */
export function chooseCardToPlay(
  hand: Card[],
  leadSuit: Suit | null,
  currentPlays: TrickPlay[],
  { bid, tricksWonSoFar }: BidContext
): Card {
  const legal = getLegalPlays(hand, leadSuit);
  const needsMoreTricks = tricksWonSoFar < bid;

  if (leadSuit === null || currentPlays.length === 0) {
    if (!needsMoreTricks) {
      return legal.reduce((lowest, card) => (card.rank < lowest.rank ? card : lowest));
    }
    const nonSpades = legal.filter((card) => card.suit !== 'spades');
    const leadPool = nonSpades.length > 0 ? nonSpades : legal;
    return leadPool.reduce((highest, card) => (card.rank > highest.rank ? card : highest));
  }

  const currentBest = currentWinningPlay(currentPlays).card;
  const winningOptions = legal.filter((card) => beats(card, currentBest, leadSuit));

  if (needsMoreTricks) {
    const pool = winningOptions.length > 0 ? winningOptions : legal;
    return pool.reduce((lowest, card) => (card.rank < lowest.rank ? card : lowest));
  }

  const losingOptions = legal.filter((card) => !beats(card, currentBest, leadSuit));
  if (losingOptions.length > 0) {
    return losingOptions.reduce((highest, card) => (card.rank > highest.rank ? card : highest));
  }
  return legal.reduce((lowest, card) => (card.rank < lowest.rank ? card : lowest));
}
