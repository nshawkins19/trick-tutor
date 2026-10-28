import { describe, it, expect, beforeEach } from 'vitest';
import { estimateBid } from '../games/spades/bidding';
import { HUMAN_PLAYER, legalPlaysForCurrentPlayer } from '../games/spades/interactiveRound';
import { useGameStore } from './gameStore';

/** Run bot moves one at a time (as the UI's timer would) until it's the human's turn or the round ends. */
function runBots() {
  const store = useGameStore.getState();
  let round = store.currentRound;
  while (round && !round.roundOver && round.currentPlayer !== HUMAN_PLAYER) {
    store.advanceBot();
    round = useGameStore.getState().currentRound;
  }
}

/** Deal a round, let bots bid, and bid the human's estimate — stops on the human's first card play. */
function dealAndBid() {
  useGameStore.getState().dealRound();
  runBots();
  const round = useGameStore.getState().currentRound!;
  useGameStore.getState().placeBid(estimateBid(round.hands[HUMAN_PLAYER]));
  runBots();
}

/** Deal, bid, and play the human's turns (first legal card each time), then score the round. */
function playFullRound() {
  dealAndBid();
  while (!useGameStore.getState().currentRound!.roundOver) {
    const round = useGameStore.getState().currentRound!;
    useGameStore.getState().playCard(legalPlaysForCurrentPlayer(round)[0]);
    runBots();
  }
  useGameStore.getState().finishRound();
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('AC-12: dealRound pauses on the humans bid, with earlier bots already bid', () => {
    useGameStore.getState().dealRound(); // dealer 0 → bidders 1, 2, 3, then human
    runBots();
    const { currentRound } = useGameStore.getState();

    expect(currentRound).not.toBeNull();
    expect(currentRound!.phase).toBe('bidding');
    expect(currentRound!.currentPlayer).toBe(0);
    expect(Object.keys(currentRound!.bids).sort()).toEqual(['1', '2', '3']);
  });

  it('placeBid starts play and pauses on the humans first card', () => {
    dealAndBid();
    const { currentRound } = useGameStore.getState();

    expect(currentRound!.phase).toBe('playing');
    expect(currentRound!.currentPlayer).toBe(0);
    expect(currentRound!.roundOver).toBe(false);
  });

  it('AC-13: playCard is ignored during bidding, placeBid is ignored during play', () => {
    useGameStore.getState().dealRound();
    runBots();
    const bidding = useGameStore.getState().currentRound!;
    useGameStore.getState().playCard(bidding.hands[0][0]);
    expect(useGameStore.getState().currentRound).toEqual(bidding);

    useGameStore.getState().placeBid(99);
    expect(useGameStore.getState().currentRound).toEqual(bidding);

    useGameStore.getState().placeBid(3);
    runBots();
    const playing = useGameStore.getState().currentRound!;
    useGameStore.getState().placeBid(4);
    expect(useGameStore.getState().currentRound).toEqual(playing);
  });

  it('playing a full round advances the dealer, clears currentRound, and records history', () => {
    playFullRound();
    const state = useGameStore.getState();

    expect(state.dealerId).toBe(1); // dealer rotates from 0
    expect(state.currentRound).toBeNull();
    expect(state.history).toHaveLength(1);
  });

  it('playing rounds accumulates points and bags cumulatively, not resetting each round', () => {
    playFullRound();
    const afterOne = useGameStore.getState().teams;

    playFullRound();
    const afterTwo = useGameStore.getState().teams;

    expect(useGameStore.getState().history).toHaveLength(2);
    expect(afterTwo).not.toEqual(afterOne);
  });

  it('resetGame clears state back to defaults', () => {
    playFullRound();
    useGameStore.getState().resetGame();
    const state = useGameStore.getState();

    expect(state.dealerId).toBe(0);
    expect(state.history).toHaveLength(0);
    expect(state.winner).toBeNull();
    expect(state.currentRound).toBeNull();
    expect(state.teams.A).toEqual({ points: 0, bags: 0 });
    expect(state.teams.B).toEqual({ points: 0, bags: 0 });
  });

  it('dealRound is a no-op once a winner is set', () => {
    useGameStore.setState({
      teams: { A: { points: 500, bags: 0 }, B: { points: 100, bags: 0 } },
      winner: 'A',
    });

    useGameStore.getState().dealRound();

    expect(useGameStore.getState().currentRound).toBeNull();
    expect(useGameStore.getState().winner).toBe('A');
  });

  it('playCard ignores plays that are not legal for the current player', () => {
    dealAndBid();
    const round = useGameStore.getState().currentRound!;
    const legal = legalPlaysForCurrentPlayer(round);
    const illegalCard = round.hands[0].find((c) => !legal.some((l) => l.id === c.id));

    if (illegalCard) {
      useGameStore.getState().playCard(illegalCard);
      // state should be unchanged — still the same round, same hand size
      expect(useGameStore.getState().currentRound).toEqual(round);
    }
  });

  it('dealRound no longer runs bots by itself — advanceBot takes one move at a time', () => {
    useGameStore.getState().dealRound(); // dealer 0 → player 1 (a bot) bids first
    expect(useGameStore.getState().currentRound!.bids).toEqual({});

    useGameStore.getState().advanceBot();
    expect(Object.keys(useGameStore.getState().currentRound!.bids)).toEqual(['1']);
  });

  it('advanceBot does nothing on the humans turn', () => {
    dealAndBid();
    const round = useGameStore.getState().currentRound!;
    useGameStore.getState().advanceBot();
    expect(useGameStore.getState().currentRound).toBe(round);
  });

  it('finishRound does nothing until the round is over', () => {
    dealAndBid();
    const round = useGameStore.getState().currentRound!;
    useGameStore.getState().finishRound();
    expect(useGameStore.getState().currentRound).toBe(round);
    expect(useGameStore.getState().history).toHaveLength(0);
  });

  it('runBots takes every bot move up to the humans turn at once', () => {
    useGameStore.getState().dealRound(); // bots 1, 2, 3 bid before the human
    useGameStore.getState().runBots();
    const round = useGameStore.getState().currentRound!;
    expect(round.currentPlayer).toBe(HUMAN_PLAYER);
    expect(Object.keys(round.bids).sort()).toEqual(['1', '2', '3']);
  });
});
