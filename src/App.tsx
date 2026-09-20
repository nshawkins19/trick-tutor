import { useGameStore } from './state/gameStore';
import type { RoundHistoryEntry } from './state/gameStore';
import { HUMAN_PLAYER, legalPlaysForCurrentPlayer, type InteractiveRoundState } from './games/spades/interactiveRound';
import type { Card, PlayerId } from './engine/types';
import './App.css';

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const RANK_LABELS: Record<number, string> = {
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

function formatCard(card: Card): string {
  const rankLabel = RANK_LABELS[card.rank] ?? String(card.rank);
  return `${rankLabel}${SUIT_SYMBOLS[card.suit]}`;
}

function LatestRound({ entry }: { entry: RoundHistoryEntry }) {
  return (
    <div style={{ marginTop: '2rem', textAlign: 'left' }}>
      <h2>Most Recent Round</h2>
      <ul>
        {(['A', 'B'] as const).map((team) => {
          const score = entry.roundScore[team];
          return (
            <li key={team}>
              Team {team} (players {team === 'A' ? '0 & 2' : '1 & 3'}): bid {score.bid}, won{' '}
              {score.tricksWon}, bags {score.bags} →{' '}
              <strong style={{ color: score.points >= 0 ? 'green' : 'crimson' }}>
                {score.points} points
              </strong>
            </li>
          );
        })}
      </ul>

      <h3>Bids vs. Tricks Won</h3>
      <ul>
        {(Object.keys(entry.tricksWonByPlayer) as unknown as PlayerId[]).map((playerId) => {
          const bid = entry.bids[playerId];
          const won = entry.tricksWonByPlayer[playerId];
          const madeIt = won >= bid;
          return (
            <li key={playerId}>
              Player {playerId}: bid {bid}, won {won}{' '}
              <span style={{ color: madeIt ? 'green' : 'crimson' }}>
                ({madeIt ? 'made it' : 'set'})
              </span>
            </li>
          );
        })}
      </ul>

      <h3>Trick-by-Trick Log</h3>
      <ol>
        {entry.completedTricks.map((trick, i) => (
          <li key={i}>
            {trick.plays.map((p) => `P${p.playerId}:${formatCard(p.card)}`).join('  ')}
            {' → winner: '}
            <strong>Player {trick.winnerId}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function YourHand({ round }: { round: InteractiveRoundState }) {
  const playCard = useGameStore((s) => s.playCard);
  const legal = legalPlaysForCurrentPlayer(round);
  const isLegal = (card: Card) => legal.some((c) => c.id === card.id);
  const hand = [...round.hands[HUMAN_PLAYER]].sort((a, b) =>
    a.suit === b.suit ? a.rank - b.rank : a.suit.localeCompare(b.suit)
  );

  return (
    <div style={{ marginTop: '2rem', textAlign: 'left' }}>
      <h2>Your Turn — Player 0 (bid {round.bids[HUMAN_PLAYER]})</h2>

      {round.currentTrickPlays.length > 0 && (
        <p>
          Trick so far:{' '}
          {round.currentTrickPlays.map((p) => `P${p.playerId}:${formatCard(p.card)}`).join('  ')}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {hand.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={!isLegal(card)}
            onClick={() => playCard(card)}
            style={{ fontSize: '1.1rem', padding: '0.5rem 0.75rem' }}
          >
            {formatCard(card)}
          </button>
        ))}
      </div>

      {round.completedTricks.length > 0 && (
        <>
          <h3>Tricks So Far This Round</h3>
          <ol>
            {round.completedTricks.map((trick, i) => (
              <li key={i}>
                {trick.plays.map((p) => `P${p.playerId}:${formatCard(p.card)}`).join('  ')}
                {' → winner: '}
                <strong>Player {trick.winnerId}</strong>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function App() {
  const { teams, history, winner, dealerId, currentRound, dealRound, resetGame } = useGameStore();

  return (
    <section id="center">
      <h1>Trick Tutor — Spades</h1>
      <p>You play Player 0. The other three seats are bots.</p>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', margin: '1rem 0' }}>
        <div>
          <strong>Team A</strong> (0 &amp; 2): {teams.A.points} pts, {teams.A.bags} bags
        </div>
        <div>
          <strong>Team B</strong> (1 &amp; 3): {teams.B.points} pts, {teams.B.bags} bags
        </div>
      </div>

      {winner ? (
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🎉 Team {winner} wins the game!</p>
      ) : (
        <p>Dealer: Player {dealerId}</p>
      )}

      {!currentRound && (
        <button type="button" className="counter" onClick={dealRound} disabled={!!winner}>
          Deal Round
        </button>
      )}
      <button type="button" className="counter" onClick={resetGame} style={{ marginLeft: '1rem' }}>
        New Game
      </button>

      {currentRound && <YourHand round={currentRound} />}
      {!currentRound && history.length > 0 && <LatestRound entry={history[history.length - 1]} />}
    </section>
  );
}

export default App;
