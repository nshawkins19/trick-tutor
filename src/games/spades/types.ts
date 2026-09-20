import type { Suit } from '../../engine/types';

// In Spades, a bid is simply the number of tricks a player/team commits to winning (0-13)
export type SpadesBid = number;

// Lead suit is the suit of the first card played in a trick
export type LeadSuit = Suit | null;
