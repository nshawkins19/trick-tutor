import { describe, it, expect, beforeEach } from 'vitest';
import { legalPlaysForCurrentPlayer } from '../games/spades/interactiveRound';
import { useGameStore } from './gameStore';

/** Deal a round and play the human's turns (first legal card each time) until it finishes. */
function playFullRound() {
  useGameStore.getState().dealRound();
  while (useGameStore.getState().currentRound) {
    const round = useGameStore.getState().currentRound!;
    useGameStore.getState().playCard(legalPlaysForCurrentPlayer(round)[0]);
  }
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('dealRound deals a round and pauses on the humans turn', () => {
    useGameStore.getState().dealRound();
    const { currentRound } = useGameStore.getState();

    expect(currentRound).not.toBeNull();
    expect(currentRound!.currentPlayer).toBe(0);
    expect(currentRound!.roundOver).toBe(false);
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
    useGameStore.getState().dealRound();
    const round = useGameStore.getState().currentRound!;
    const legal = legalPlaysForCurrentPlayer(round);
    const illegalCard = round.hands[0].find((c) => !legal.some((l) => l.id === c.id));

    if (illegalCard) {
      useGameStore.getState().playCard(illegalCard);
      // state should be unchanged — still the same round, same hand size
      expect(useGameStore.getState().currentRound).toEqual(round);
    }
  });
});
