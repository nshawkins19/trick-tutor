import { create } from 'zustand';
import type { Card, PlayerId } from '../engine/types';
import {
  HUMAN_PLAYER,
  advanceBots,
  applyCardPlay,
  legalPlaysForCurrentPlayer,
  startInteractiveRound,
  type InteractiveRoundState,
} from '../games/spades/interactiveRound';
import { applyBagPenalty, scoreRound, type Team, type TeamScore } from '../games/spades/scoring';

const WINNING_SCORE = 500;

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
  playCard: (card: Card) => void;
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

    set({ currentRound: advanceBots(startInteractiveRound(dealerId)) });
  },

  playCard: (card: Card) => {
    const { currentRound, dealerId, teams, history } = get();
    if (!currentRound || currentRound.roundOver || currentRound.currentPlayer !== HUMAN_PLAYER) {
      return;
    }
    const legal = legalPlaysForCurrentPlayer(currentRound);
    if (!legal.some((c) => c.id === card.id)) return;

    const afterPlay = advanceBots(applyCardPlay(currentRound, card));

    if (!afterPlay.roundOver) {
      set({ currentRound: afterPlay });
      return;
    }

    const roundScore = scoreRound(afterPlay.bids, afterPlay.tricksWonByPlayer);
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
          bids: afterPlay.bids,
          tricksWonByPlayer: afterPlay.tricksWonByPlayer,
          completedTricks: afterPlay.completedTricks,
          roundScore,
        },
      ],
      winner: winningTeam,
    });
  },

  resetGame: () =>
    set({ dealerId: 0, teams: freshTeams(), history: [], winner: null, currentRound: null }),
}));
