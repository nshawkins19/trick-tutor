import { describe, it, expect } from 'vitest';
import {
  HUMAN_PLAYER,
  advanceBots,
  applyCardPlay,
  legalPlaysForCurrentPlayer,
  startInteractiveRound,
} from './interactiveRound';

describe('interactive round', () => {
  it('startInteractiveRound deals 13 cards to each player and starts left of the dealer', () => {
    const state = startInteractiveRound(0);
    expect(state.hands[0]).toHaveLength(13);
    expect(state.hands[1]).toHaveLength(13);
    expect(state.hands[2]).toHaveLength(13);
    expect(state.hands[3]).toHaveLength(13);
    expect(state.currentPlayer).toBe(1);
    expect(state.roundOver).toBe(false);
  });

  it('applyCardPlay advances to the next player mid-trick without completing it', () => {
    const state = startInteractiveRound(0);
    const card = legalPlaysForCurrentPlayer(state)[0];
    const next = applyCardPlay(state, card);

    expect(next.currentPlayer).toBe(2);
    expect(next.currentTrickPlays).toHaveLength(1);
    expect(next.hands[1]).toHaveLength(12);
    expect(next.completedTricks).toHaveLength(0);
  });

  it('applyCardPlay completes a trick after the 4th play and hands the lead to the winner', () => {
    let state = startInteractiveRound(0);
    for (let i = 0; i < 4; i++) {
      const card = legalPlaysForCurrentPlayer(state)[0];
      state = applyCardPlay(state, card);
    }

    expect(state.completedTricks).toHaveLength(1);
    expect(state.currentTrickPlays).toHaveLength(0);
    expect(state.currentPlayer).toBe(state.completedTricks[0].winnerId);
    expect(state.tricksWonByPlayer[state.currentPlayer]).toBe(1);
  });

  it('advanceBots plays through bot turns and stops on the human player', () => {
    const state = startInteractiveRound(0); // currentPlayer starts at 1 (a bot)
    const afterBots = advanceBots(state);

    expect(afterBots.currentPlayer === HUMAN_PLAYER || afterBots.roundOver).toBe(true);
  });

  it('advanceBots is a no-op when it is already the human players turn', () => {
    const state = startInteractiveRound(3); // dealer 3 -> currentPlayer starts at 0 (human)
    expect(state.currentPlayer).toBe(HUMAN_PLAYER);

    const result = advanceBots(state);
    expect(result).toEqual(state);
  });

  it('a full round played by starting + repeatedly advancing bots and auto-playing the human ends after 13 tricks', () => {
    let state = advanceBots(startInteractiveRound(0));

    while (!state.roundOver) {
      const card = legalPlaysForCurrentPlayer(state)[0];
      state = advanceBots(applyCardPlay(state, card));
    }

    expect(state.completedTricks).toHaveLength(13);
    const totalTricks = Object.values(state.tricksWonByPlayer).reduce((a, b) => a + b, 0);
    expect(totalTricks).toBe(13);
    expect(state.hands[0]).toHaveLength(0);
    expect(state.hands[1]).toHaveLength(0);
    expect(state.hands[2]).toHaveLength(0);
    expect(state.hands[3]).toHaveLength(0);
  });
});
