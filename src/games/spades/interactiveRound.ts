import { buildDeck, shuffle } from '../../engine/deck';
import { initializeRound } from '../../engine/deal';
import type { Card, PlayerId, Suit, Trick, TrickPlay } from '../../engine/types';
import { estimateBid } from './bidding';
import { chooseCardToPlay, evaluateTrick, getLegalPlays } from './logic';

/** The seat a human plays; the other three are always bots. */
export const HUMAN_PLAYER: PlayerId = 0;

export const MIN_BID = 0;
export const MAX_BID = 13;

export type RoundPhase = 'bidding' | 'playing';

export interface InteractiveRoundState {
  dealerId: PlayerId;
  phase: RoundPhase;
  hands: Record<PlayerId, Card[]>;
  /** Filled in one at a time during the bidding phase; complete once playing. */
  bids: Partial<Record<PlayerId, number>>;
  tricksWonByPlayer: Record<PlayerId, number>;
  completedTricks: Trick[];
  currentTrickPlays: TrickPlay[];
  leadSuit: Suit | null;
  /** True once any spade has been played this round — spades may then be led. */
  spadesBroken: boolean;
  currentPlayer: PlayerId;
  roundOver: boolean;
}

function nextPlayer(playerId: PlayerId): PlayerId {
  return ((playerId + 1) % 4) as PlayerId;
}

/** Deal a fresh round. Bidding starts left of the dealer. */
export function startInteractiveRound(dealerId: PlayerId): InteractiveRoundState {
  const deck = shuffle(buildDeck());
  const round = initializeRound<number>(dealerId, deck);

  return {
    dealerId,
    phase: 'bidding',
    hands: {
      0: [...round.hands[0]],
      1: [...round.hands[1]],
      2: [...round.hands[2]],
      3: [...round.hands[3]],
    },
    bids: {},
    tricksWonByPlayer: { 0: 0, 1: 0, 2: 0, 3: 0 },
    completedTricks: [],
    currentTrickPlays: [],
    leadSuit: null,
    spadesBroken: false,
    currentPlayer: nextPlayer(dealerId),
    roundOver: false,
  };
}

export function isValidBid(bid: number): boolean {
  return Number.isInteger(bid) && bid >= MIN_BID && bid <= MAX_BID;
}

/**
 * Record `bid` for `state.currentPlayer`. After the 4th bid, switches to the
 * playing phase with the player left of the dealer leading the first trick.
 */
export function placeBid(state: InteractiveRoundState, bid: number): InteractiveRoundState {
  if (state.phase !== 'bidding') {
    throw new Error('placeBid called outside the bidding phase');
  }
  if (!isValidBid(bid)) {
    throw new Error(`Bid must be a whole number from ${MIN_BID} to ${MAX_BID}, got ${bid}`);
  }

  const bids = { ...state.bids, [state.currentPlayer]: bid };
  if (Object.keys(bids).length < 4) {
    return { ...state, bids, currentPlayer: nextPlayer(state.currentPlayer) };
  }
  return { ...state, bids, phase: 'playing', currentPlayer: nextPlayer(state.dealerId) };
}

/** Every player's bid, for scoring. Throws if bidding isn't finished. */
export function completedBids(state: InteractiveRoundState): Record<PlayerId, number> {
  const ids: PlayerId[] = [0, 1, 2, 3];
  const missing = ids.filter((id) => state.bids[id] === undefined);
  if (missing.length > 0) {
    throw new Error(`Bidding isn't finished: no bid yet from player(s) ${missing.join(', ')}`);
  }
  return state.bids as Record<PlayerId, number>;
}

/** The cards `state.currentPlayer` is allowed to play right now. */
export function legalPlaysForCurrentPlayer(state: InteractiveRoundState): Card[] {
  return getLegalPlays(state.hands[state.currentPlayer], state.leadSuit, state.spadesBroken);
}

/**
 * Play `card` for `state.currentPlayer`. If it completes the trick (4th
 * play), evaluates the winner, records the trick, and hands the lead to
 * whoever won. Marks the round over once the 13th trick completes.
 */
export function applyCardPlay(state: InteractiveRoundState, card: Card): InteractiveRoundState {
  if (state.phase !== 'playing') {
    throw new Error('applyCardPlay called outside the playing phase');
  }
  const player = state.currentPlayer;
  const hands = {
    ...state.hands,
    [player]: state.hands[player].filter((c) => c.id !== card.id),
  };
  const currentTrickPlays = [...state.currentTrickPlays, { playerId: player, card }];
  const leadSuit = state.leadSuit ?? card.suit;
  const spadesBroken = state.spadesBroken || card.suit === 'spades';

  if (currentTrickPlays.length < 4) {
    return { ...state, hands, currentTrickPlays, leadSuit, spadesBroken, currentPlayer: nextPlayer(player) };
  }

  const winnerId = evaluateTrick(currentTrickPlays);
  const tricksWonByPlayer = {
    ...state.tricksWonByPlayer,
    [winnerId]: state.tricksWonByPlayer[winnerId] + 1,
  };
  const completedTricks = [...state.completedTricks, { leadSuit, plays: currentTrickPlays, winnerId }];

  return {
    ...state,
    hands,
    tricksWonByPlayer,
    completedTricks,
    currentTrickPlays: [],
    leadSuit: null,
    spadesBroken,
    currentPlayer: winnerId,
    roundOver: completedTricks.length === 13,
  };
}

/** True when it's a bot's move (bid or card) and the round isn't over. */
export function isBotTurn(state: InteractiveRoundState): boolean {
  return !state.roundOver && state.currentPlayer !== HUMAN_PLAYER;
}

/**
 * Take exactly one bot action — a bid during bidding, a card during play.
 * Returns `state` unchanged if it isn't a bot's turn. The UI calls this on a
 * timer so each bot move can be seen (and animated) on its own.
 */
export function advanceOneBot(state: InteractiveRoundState): InteractiveRoundState {
  if (!isBotTurn(state)) return state;

  const player = state.currentPlayer;
  if (state.phase === 'bidding') {
    return placeBid(state, estimateBid(state.hands[player]));
  }
  const card = chooseCardToPlay(state.hands[player], state.leadSuit, state.currentTrickPlays, {
    bid: state.bids[player] ?? 0,
    tricksWonSoFar: state.tricksWonByPlayer[player],
    spadesBroken: state.spadesBroken,
  });
  return applyCardPlay(state, card);
}

/**
 * Auto-play every bot's turn — bids during bidding, cards during play — until
 * it's the human's turn again (in either phase), or the round ends.
 */
export function advanceBots(state: InteractiveRoundState): InteractiveRoundState {
  let next = state;
  while (isBotTurn(next)) {
    next = advanceOneBot(next);
  }
  return next;
}
