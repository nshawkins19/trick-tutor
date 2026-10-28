import { create } from 'zustand';
import type { Card, PlayerId } from '../engine/types';
import {
  HUMAN_PLAYER,
  advanceBots,
  advanceOneBot,
  applyCardPlay,
  completedBids,
  isBotTurn,
  isValidBid,
  legalPlaysForCurrentPlayer,
  placeBid,
  startInteractiveRound,
  type InteractiveRoundState,
} from '../games/spades/interactiveRound';
import { applyBagPenalty, scoreRound, type Team, type TeamScore } from '../games/spades/scoring';

export const WINNING_SCORE = 500;

export interface TeamGameState {
  points: number;
  bags: number;
}

export interface RoundHistoryEntry {
  bids: Record<PlayerId, number>;
  tricksWonByPlayer: Record<PlayerId, number>;
  completedTricks: InteractiveRoundState['completedTricks'];
  roundScore: Record<Team, TeamScore>;
}

interface GameStore {
  dealerId: PlayerId;
  teams: Record<Team, TeamGameState>;
  history: RoundHistoryEntry[];
  winner: Team | null;
  currentRound: InteractiveRoundState | null;
  dealRound: () => void;
  placeBid: (bid: number) => void;
  playCard: (card: Card) => void;
  /** Take one bot action (bid or card). The UI calls this on a timer. */
  advanceBot: () => void;
  /** Take every bot action up to the human's turn at once ("Skip bot turns"). */
  runBots: () => void;
  /** Score a finished round and clear it. No-op until all 13 tricks are played. */
  finishRound: () => void;
  resetGame: () => void;
}

function nextDealer(dealerId: PlayerId): PlayerId {
  return ((dealerId + 1) % 4) as PlayerId;
}

function freshTeams(): Record<Team, TeamGameState> {
  return {
    A: { points: 0, bags: 0 },
    B: { points: 0, bags: 0 },
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  dealerId: 0,
  teams: freshTeams(),
  history: [],
  winner: null,
  currentRound: null,

  dealRound: () => {
    const { dealerId, winner } = get();
    if (winner) return;

    set({ currentRound: startInteractiveRound(dealerId) });
  },

  placeBid: (bid: number) => {
    const { currentRound } = get();
    if (
      !currentRound ||
      currentRound.phase !== 'bidding' ||
      currentRound.currentPlayer !== HUMAN_PLAYER ||
      !isValidBid(bid)
    ) {
      return;
    }

    set({ currentRound: placeBid(currentRound, bid) });
  },

  playCard: (card: Card) => {
    const { currentRound } = get();
    if (
      !currentRound ||
      currentRound.phase !== 'playing' ||
      currentRound.roundOver ||
      currentRound.currentPlayer !== HUMAN_PLAYER
    ) {
      return;
    }
    const legal = legalPlaysForCurrentPlayer(currentRound);
    if (!legal.some((c) => c.id === card.id)) return;

    set({ currentRound: applyCardPlay(currentRound, card) });
  },

  advanceBot: () => {
    const { currentRound } = get();
    if (!currentRound || !isBotTurn(currentRound)) return;

    set({ currentRound: advanceOneBot(currentRound) });
  },

  runBots: () => {
    const { currentRound } = get();
    if (!currentRound || !isBotTurn(currentRound)) return;

    set({ currentRound: advanceBots(currentRound) });
  },

  finishRound: () => {
    const { currentRound: finished, dealerId, teams, history } = get();
    if (!finished || !finished.roundOver) return;

    const bids = completedBids(finished);
    const roundScore = scoreRound(bids, finished.tricksWonByPlayer);
    const nextTeams: Record<Team, TeamGameState> = { ...teams };
    for (const team of Object.keys(teams) as Team[]) {
      const { bags, penalty } = applyBagPenalty(teams[team].bags, roundScore[team].bags);
      nextTeams[team] = {
        points: teams[team].points + roundScore[team].points + penalty,
        bags,
      };
    }

    const winningTeam =
      (Object.keys(nextTeams) as Team[]).find((team) => nextTeams[team].points >= WINNING_SCORE) ??
      null;

    set({
      currentRound: null,
      dealerId: nextDealer(dealerId),
      teams: nextTeams,
      history: [
        ...history,
        {
          bids,
          tricksWonByPlayer: finished.tricksWonByPlayer,
          completedTricks: finished.completedTricks,
          roundScore,
        },
      ],
      winner: winningTeam,
    });
  },

  resetGame: () =>
    set({ dealerId: 0, teams: freshTeams(), history: [], winner: null, currentRound: null }),
}));
