import { useEffect, useState, type ReactNode } from 'react';
import type { Card } from '../../engine/types';
import { explainLegalPlays } from '../../games/spades/hints';
import {
  HUMAN_PLAYER,
  isBotTurn,
  legalPlaysForCurrentPlayer,
  type InteractiveRoundState,
} from '../../games/spades/interactiveRound';
import { WINNING_SCORE, useGameStore } from '../../state/gameStore';
import { useSettingsStore } from '../../state/settingsStore';
import { BiddingPanel } from '../components/BiddingPanel/BiddingPanel';
import { Hand } from '../components/Hand/Hand';
import { RoundSummary } from '../components/ScoreBoard/RoundSummary';
import { ScoreBoard } from '../components/ScoreBoard/ScoreBoard';
import { SEATS, TEAM_NAMES } from '../components/Table/seats';
import { RoundInfo } from '../components/Table/RoundInfo';
import { Table } from '../components/Table/Table';
import { withViewTransition } from '../viewTransition';
import { TRICK_HOLD_MS, botDelayMs } from './pacing';
import '../game.css';

/**
 * Drives everything that happens without the human clicking: bot moves on a
 * timer, holding each finished trick in the center for a moment, and scoring
 * the round once the last trick has been seen. Returns whether a finished
 * trick is currently being held.
 */
function useRoundPacing(round: InteractiveRoundState): boolean {
  const advanceBot = useGameStore((s) => s.advanceBot);
  const runBots = useGameStore((s) => s.runBots);
  const finishRound = useGameStore((s) => s.finishRound);
  const skipBotTurns = useSettingsStore((s) => s.skipBotTurns);

  // How many completed tricks have finished their "hold" in the center.
  const [shownTricks, setShownTricks] = useState(0);
  const tricksDone = round.completedTricks.length;
  const holdingTrick = !skipBotTurns && tricksDone > 0 && tricksDone !== shownTricks;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (holdingTrick) {
      timer = setTimeout(() => withViewTransition(() => setShownTricks(tricksDone)), TRICK_HOLD_MS);
    } else if (round.roundOver) {
      finishRound();
    } else if (isBotTurn(round)) {
      if (skipBotTurns) runBots();
      else timer = setTimeout(() => withViewTransition(advanceBot), botDelayMs(round));
    }
    return () => clearTimeout(timer);
  }, [round, holdingTrick, tricksDone, skipBotTurns, advanceBot, runBots, finishRound]);

  return holdingTrick;
}

function statusText(round: InteractiveRoundState, holdingTrick: boolean): string {
  if (holdingTrick) {
    const winnerId = round.completedTricks[round.completedTricks.length - 1].winnerId;
    return winnerId === HUMAN_PLAYER ? 'You won the trick!' : `${SEATS[winnerId ?? 0].name} won the trick.`;
  }
  if (round.currentPlayer !== HUMAN_PLAYER) {
    return round.phase === 'bidding'
      ? `${SEATS[round.currentPlayer].name} is bidding…`
      : `${SEATS[round.currentPlayer].name} is playing…`;
  }
  return explainLegalPlays(round.hands[HUMAN_PLAYER], round.leadSuit, round.spadesBroken);
}

function ActiveRound({ round, scoreboard }: { round: InteractiveRoundState; scoreboard: ReactNode }) {
  const placeBid = useGameStore((s) => s.placeBid);
  const playCard = useGameStore((s) => s.playCard);
  const holdingTrick = useRoundPacing(round);
  const [biddingCollapsed, setBiddingCollapsed] = useState(false);
  const myHand = round.hands[HUMAN_PLAYER];
  const myTurn = round.currentPlayer === HUMAN_PLAYER && !round.roundOver && !holdingTrick;

  const onBid = (bid: number) => withViewTransition(() => placeBid(bid));
  const onPlay = (card: Card) => withViewTransition(() => playCard(card));

  const biddingPanel =
    round.phase === 'bidding' && myTurn ? (
      <BiddingPanel
        round={round}
        onBid={onBid}
        collapsed={biddingCollapsed}
        onToggleCollapsed={() => setBiddingCollapsed((c) => !c)}
      />
    ) : undefined;

  return (
    <>
      <main className="game__main">
        <Table
          round={round}
          holdingTrick={holdingTrick}
          overlay={biddingPanel}
          corners={<RoundInfo round={round} holdingTrick={holdingTrick} />}
        />
        <div className="player-area">
          <p className="status-line" role="status">
            {round.phase === 'bidding' && myTurn ? 'Your bid — use the panel on the table.' : statusText(round, holdingTrick)}
          </p>
          {round.phase === 'playing' && myTurn ? (
            <Hand cards={myHand} legal={legalPlaysForCurrentPlayer(round)} onPlay={onPlay} />
          ) : (
            <Hand cards={myHand} />
          )}
        </div>
      </main>
      <aside className="game__rail">
        {scoreboard}
        <div className="rail__round-info">
          <RoundInfo round={round} holdingTrick={holdingTrick} />
        </div>
      </aside>
    </>
  );
}

export function GameScreen() {
  const { teams, history, winner, currentRound, dealRound, resetGame } = useGameStore();
  const lastEntry = history[history.length - 1];

  const scoreboard = (
    <ScoreBoard
      teams={teams}
      roundNumber={history.length + (currentRound ? 1 : 0) || 1}
      winningScore={WINNING_SCORE}
      onNewGame={resetGame}
      round={currentRound}
    />
  );

  return (
    <div className="game">
      {currentRound ? (
        <ActiveRound round={currentRound} scoreboard={scoreboard} />
      ) : (
        <>
          <main className="game__main between-rounds">
            {winner && (
              <div className="winner-banner" role="status">
                {winner === 'A' ? 'You and your partner win!' : `${TEAM_NAMES[winner]} win this one.`}
              </div>
            )}
            {lastEntry ? (
              <RoundSummary entry={lastEntry} roundNumber={history.length} />
            ) : (
              <div className="welcome">
                <h1>Spades</h1>
                <p>
                  You sit at the bottom with your partner across the table. Bid how many tricks you'll take, then try
                  to make it. Spades are always trump.
                </p>
              </div>
            )}
            {winner ? (
              <button type="button" className="button" onClick={resetGame}>
                New game
              </button>
            ) : (
              <button type="button" className="button" onClick={() => withViewTransition(dealRound)}>
                {lastEntry ? 'Deal next round' : 'Deal first round'}
              </button>
            )}
          </main>
          <aside className="game__rail">{scoreboard}</aside>
        </>
      )}
    </div>
  );
}
