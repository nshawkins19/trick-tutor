import type { Card, Rank, Suit } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
}

// TODO(human): implement shuffle(deck)
// Should return a NEW array containing the same 52 cards in random order
// (don't mutate the input — the caller may still hold a reference to the
// original deck, e.g. for tests that check "same cards, different order").
export function shuffle(deck: Card[]): Card[] {
  const newDeck: Card[] = [...deck]; // the new array to return
  for(var i = newDeck.length-1; i >0; i--){
      var swapCardPlaceholder: Card = newDeck[i];
      var spot = Math.floor(Math.random()*(i+1));

      newDeck[i] = newDeck[spot];
      newDeck[spot] = swapCardPlaceholder;
  }

  return newDeck; // method stub
}


