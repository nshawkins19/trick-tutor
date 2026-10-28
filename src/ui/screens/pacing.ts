import type { InteractiveRoundState } from '../../games/spades/interactiveRound';

/** How long a finished trick stays in the center before sliding to "Last trick". */
export const TRICK_HOLD_MS = 1200;

/**
 * How long to wait before the next bot move, so each one can be watched.
 * Called whenever it's a bot's turn (bidding or playing). Every delay stays
 * above the ~420ms card animation so moves never cut each other off.
 */
export function botDelayMs(round: InteractiveRoundState): number {
  if (round.phase === 'bidding') return 550; // bids are just numbers on a badge — keep them brisk
  // Leading sets up the trick, so give it a beat longer than following suit.
  return round.currentTrickPlays.length === 0 ? 900 : 650;
}
