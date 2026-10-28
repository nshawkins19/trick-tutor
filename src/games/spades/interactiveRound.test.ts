import { describe, it, expect } from 'vitest';
import type { PlayerId } from '../../engine/types';
import { estimateBid } from './bidding';
import {
  HUMAN_PLAYER,
  advanceBots,
  advanceOneBot,
  applyCardPlay,
  completedBids,
  legalPlaysForCurrentPlayer,
  placeBid,
  startInteractiveRound,
  type InteractiveRoundState,
} from './interactiveRound';

/** Deal a round and have all four seats bid their estimate, ready for the first lead. */
function startPlayingRound(dealerId: PlayerId): InteractiveRoundState {
  let state = startInteractiveRound(dealerId);
  for (let i = 0; i < 4; i++) {
    state = placeBid(state, estimateBid(state.hands[state.currentPlayer]));
  }
  return state;
}

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
    const state = startPlayingRound(0);
    const card = legalPlaysForCurrentPlayer(state)[0];
    const next = applyCardPlay(state, card);

    expect(next.currentPlayer).toBe(2);
    expect(next.currentTrickPlays).toHaveLength(1);
    expect(next.hands[1]).toHaveLength(12);
    expect(next.completedTricks).toHaveLength(0);
  });

  it('applyCardPlay completes a trick after the 4th play and hands the lead to the winner', () => {
    let state = startPlayingRound(0);
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
    const state = startPlayingRound(0); // currentPlayer starts at 1 (a bot)
    const afterBots = advanceBots(state);

    expect(afterBots.currentPlayer === HUMAN_PLAYER || afterBots.roundOver).toBe(true);
  });

  it('advanceBots is a no-op when it is already the human players turn', () => {
    const state = startPlayingRound(3); // dealer 3 -> currentPlayer starts at 0 (human)
    expect(state.currentPlayer).toBe(HUMAN_PLAYER);

    const result = advanceBots(state);
    expect(result).toEqual(state);
  });

  it('AC-11: a full round through bidding and 13 tricks ends cleanly with no illegal leads', () => {
    let state = advanceBots(startInteractiveRound(0));
    state = advanceBots(placeBid(state, estimateBid(state.hands[HUMAN_PLAYER])));

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

    // Replay the leads. A spade led before spades were broken is only legal
    // from an all-spade hand — so every card that player played from then on
    // must also be a spade.
    let broken = false;
    for (const trick of state.completedTricks) {
      const lead = trick.plays[0];
      if (lead.card.suit === 'spades' && !broken) {
        const leaderPlays = state.completedTricks
          .flatMap((t) => t.plays)
          .filter((p) => p.playerId === lead.playerId);
        const fromLead = leaderPlays.slice(leaderPlays.findIndex((p) => p.card.id === lead.card.id));
        expect(fromLead.every((p) => p.card.suit === 'spades')).toBe(true);
      }
      if (trick.plays.some((p) => p.card.suit === 'spades')) broken = true;
    }
  });
});

describe('spades broken (spec 002)', () => {
  it('AC-6: spadesBroken starts false and flips on the first spade played', () => {
    let state = startPlayingRound(0);
    expect(state.spadesBroken).toBe(false);

    while (!state.roundOver) {
      const card = legalPlaysForCurrentPlayer(state)[0];
      const before = state.spadesBroken;
      state = applyCardPlay(state, card);
      if (card.suit === 'spades') {
        expect(state.spadesBroken).toBe(true);
        return;
      }
      expect(state.spadesBroken).toBe(before);
    }
  });
});

describe('bidding phase (spec 002)', () => {
  it('AC-7: a new round starts in bidding with no bids, dealer-left first', () => {
    const state = startInteractiveRound(2);
    expect(state.phase).toBe('bidding');
    expect(state.bids).toEqual({});
    expect(state.currentPlayer).toBe(3);
  });

  it('AC-8: advanceBots fills in bot bids up to the human and stops', () => {
    const state = advanceBots(startInteractiveRound(1)); // bidders: 2, 3, then human 0
    expect(state.phase).toBe('bidding');
    expect(state.currentPlayer).toBe(HUMAN_PLAYER);
    expect(Object.keys(state.bids).sort()).toEqual(['2', '3']);
    expect(state.bids[2]).toBe(estimateBid(state.hands[2]));
  });

  it('AC-9: after four bids, phase is playing and dealer-left leads', () => {
    let state = startInteractiveRound(1);
    for (const bid of [3, 2, 4, 1]) state = placeBid(state, bid);

    expect(state.phase).toBe('playing');
    expect(state.currentPlayer).toBe(2);
    expect(completedBids(state)).toEqual({ 2: 3, 3: 2, 0: 4, 1: 1 });
  });

  it('AC-10: placeBid rejects out-of-range or fractional bids and bids during play', () => {
    const state = startInteractiveRound(0);
    expect(() => placeBid(state, -1)).toThrow();
    expect(() => placeBid(state, 14)).toThrow();
    expect(() => placeBid(state, 2.5)).toThrow();
    expect(() => placeBid(startPlayingRound(0), 3)).toThrow();
  });

  it('completedBids throws while bidding is unfinished, and applyCardPlay refuses to run', () => {
    const state = placeBid(startInteractiveRound(0), 3);
    expect(() => completedBids(state)).toThrow();
    expect(() => applyCardPlay(state, state.hands[state.currentPlayer][0])).toThrow();
  });

  it('advanceOneBot takes exactly one bot action per call', () => {
    const start = startInteractiveRound(0); // bidders 1, 2, 3, then human
    const afterOne = advanceOneBot(start);
    expect(Object.keys(afterOne.bids)).toEqual(['1']);
    expect(afterOne.currentPlayer).toBe(2);

    const playing = startPlayingRound(0); // player 1 (a bot) leads
    const afterLead = advanceOneBot(playing);
    expect(afterLead.currentTrickPlays).toHaveLength(1);
    expect(afterLead.currentTrickPlays[0].playerId).toBe(1);
  });

  it('advanceOneBot is a no-op on the human turn', () => {
    const state = startPlayingRound(3); // human leads
    expect(advanceOneBot(state)).toBe(state);
  });
});
