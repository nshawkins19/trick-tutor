import type { PlayerId } from '../../engine/types';

export type Team = 'A' | 'B';

// Standard Spades partnerships: players across the table are partners
const TEAM_PLAYERS: Record<Team, PlayerId[]> = {
  A: [0, 2],
  B: [1, 3],
};

export function getTeam(playerId: PlayerId): Team {
  return playerId === 0 || playerId === 2 ? 'A' : 'B';
}

export interface TeamScore {
  bid: number;
  tricksWon: number;
  bags: number;
  points: number;
}

/**
 * Score one round of Spades for both partnerships.
 *
 * A team's bid and tricks won are the sum of its two players' bids/tricks.
 * - Making the bid: 10 points per bid trick, plus 1 point per "bag"
 *   (each trick won beyond the bid)
 * - Missing the bid ("set"): lose 10 points per bid trick, regardless of
 *   how many tricks were actually won
 *
 * Note: this does not apply the cumulative bag penalty (-100 at 10 bags) —
 * see `applyBagPenalty`, which a persistent game loop calls separately
 * since it needs bag totals carried over from previous rounds.
 */
export function scoreRound(
  bids: Record<PlayerId, number>,
  tricksWonByPlayer: Record<PlayerId, number>
): Record<Team, TeamScore> {
  const scores = {} as Record<Team, TeamScore>;

  for (const team of Object.keys(TEAM_PLAYERS) as Team[]) {
    const players = TEAM_PLAYERS[team];
    const bid = players.reduce((sum: number, p) => sum + bids[p], 0);
    const tricksWon = players.reduce((sum: number, p) => sum + tricksWonByPlayer[p], 0);

    const madeBid = tricksWon >= bid;
    const bags = madeBid ? tricksWon - bid : 0;
    const points = madeBid ? bid * 10 + bags : bid * -10;

    scores[team] = { bid, tricksWon, bags, points };
  }

  return scores;
}

export interface BagPenaltyResult {
  bags: number; // carried-over bag count after this round (0-9)
  penalty: number; // points to subtract (0, or a multiple of -100)
}

/**
 * Every time a team's cumulative bags reach 10, they're penalized 100
 * points and the bag count wraps back down. Called once per round per
 * team, threading the running bag total from the previous round in.
 */
export function applyBagPenalty(previousBags: number, roundBags: number): BagPenaltyResult {
  const totalBags = previousBags + roundBags;
  const penaltyCount = Math.floor(totalBags / 10);

  return {
    bags: totalBags % 10,
    penalty: penaltyCount > 0 ? -100 * penaltyCount : 0,
  };
}
