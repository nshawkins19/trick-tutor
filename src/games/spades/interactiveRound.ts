import { buildDeck, shuffle } from '../../engine/deck';
import { initializeRound } from '../../engine/deal';
import type { Card, PlayerId, Suit, Trick, TrickPlay } from '../../engine/types';
import { collectBids } from './bidding';
import { chooseCardToPlay, evaluateTrick, getLegalPlays } from './logic';

/** The seat a human plays; the other three are always bots. */
export const HUMAN_PLAYER: PlayerId = 0;

export interface InteractiveRoundState {
  dealerId: PlayerId;
  hands: Record<PlayerId, Card[]>;
  bids: Record<PlayerId, number>;
  tricksWonByPlayer: Record<PlayerId, number>;
  completedTricks: Trick[];
  currentTrickPlays: TrickPlay[];
  leadSuit: Suit | null;
  currentPlayer: PlayerId;
  roundOver: boolean;
}

function nextPlayer(playerId: PlayerId): PlayerId {
  return ((playerId + 1) % 4) as PlayerId;
}

/** Deal a fresh round and collect bids. `currentPlayer` starts left of the dealer. */
export function startInteractiveRound(dealerId: PlayerId): InteractiveRoundState {
  const deck = shuffle(buildDeck());
  const round = initializeRound<number>(dealerId, deck);

  return {
    dealerId,
    hands: {
      0: [...round.hands[0]],
      1: [...round.hands[1]],
      2: [...round.hands[2]],
      3: [...round.hands[3]],
    },
    bids: collectBids(round.hands, dealerId),
    tricksWonByPlayer: { 0: 0, 1: 0, 2: 0, 3: 0 },
    completedTricks: [],
    currentTrickPlays: [],
    leadSuit: null,
    currentPlayer: nextPlayer(dealerId),
    roundOver: false,
  };
}

/** The cards `state.currentPlayer` is allowed to play right now. */
export function legalPlaysForCurrentPlayer(state: InteractiveRoundState): Card[] {
  return getLegalPlays(state.hands[state.currentPlayer], state.leadSuit);
}

/**
 * Play `card` for `state.currentPlayer`. If it completes the trick (4th
 * play), evaluates the winner, records the trick, and hands the lead to
 * whoever won. Marks the round over once the 13th trick completes.
 */
export function applyCardPlay(state: InteractiveRoundState, card: Card): InteractiveRoundState {
  const player = state.currentPlayer;
  const hands = {
    ...state.hands,
    [player]: state.hands[player].filter((c) => c.id !== card.id),
  };
  const currentTrickPlays = [...state.currentTrickPlays, { playerId: player, card }];
  const leadSuit = state.leadSuit ?? card.suit;

  if (currentTrickPlays.length < 4) {
    return { ...state, hands, currentTrickPlays, leadSuit, currentPlayer: nextPlayer(player) };
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
    currentPlayer: winnerId,
    roundOver: completedTricks.length === 13,
  };
}

/** Auto-play every bot's turn in sequence until it's the human's turn again, or the round ends. */
export function advanceBots(state: InteractiveRoundState): InteractiveRoundState {
  let next = state;

  while (!next.roundOver && next.currentPlayer !== HUMAN_PLAYER) {
    const card = chooseCardToPlay(next.hands[next.currentPlayer], next.leadSuit, next.currentTrickPlays, {
      bid: next.bids[next.currentPlayer],
      tricksWonSoFar: next.tricksWonByPlayer[next.currentPlayer],
    });
    next = applyCardPlay(next, card);
  }

  return next;
}
