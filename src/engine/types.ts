export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

// Numeric ranks make comparisons (rank > rank) trivial. 11=J, 12=Q, 13=K, 14=A.
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // `${suit}-${rank}`, stable across shuffles — used as the React key
}

export type PlayerId = 0 | 1 | 2 | 3;

export interface Player {
  id: PlayerId;
  name: string;
  isBot: boolean;
  teamId?: number; // undefined for non-partnership games (e.g. a future solo game)
}

export interface TrickPlay {
  playerId: PlayerId;
  card: Card;
}

export interface Trick {
  leadSuit: Suit | null;
  plays: TrickPlay[]; // 0..4, filled in turn order
  winnerId: PlayerId | null;
}

export interface Round<TBid> {
  dealerId: PlayerId;
  hands: Record<PlayerId, Card[]>;
  bids: Partial<Record<PlayerId, TBid>>;
  tricks: Trick[];
  currentTrick: Trick;
}

export type GamePhase =
  | 'dealing'
  | 'bidding'
  | 'playing'
  | 'scoring'
  | 'roundOver'
  | 'gameOver';
