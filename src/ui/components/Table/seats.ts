import type { PlayerId } from '../../../engine/types';
import { getTeam, type Team } from '../../../games/spades/scoring';

export type SeatPosition = 'bottom' | 'left' | 'top' | 'right';

export interface Seat {
  playerId: PlayerId;
  name: string;
  position: SeatPosition;
  team: Team;
}

// Play goes clockwise, so from the human's chair the next player is on the left.
export const SEATS: Record<PlayerId, Seat> = {
  0: { playerId: 0, name: 'You', position: 'bottom', team: getTeam(0) },
  1: { playerId: 1, name: 'West', position: 'left', team: getTeam(1) },
  2: { playerId: 2, name: 'Partner', position: 'top', team: getTeam(2) },
  3: { playerId: 3, name: 'East', position: 'right', team: getTeam(3) },
};

export const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];

export const TEAM_NAMES: Record<Team, string> = {
  A: 'You & Partner',
  B: 'West & East',
};
