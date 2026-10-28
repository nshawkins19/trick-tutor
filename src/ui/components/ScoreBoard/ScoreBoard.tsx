import type { PlayerId } from '../../../engine/types';
import type { InteractiveRoundState } from '../../../games/spades/interactiveRound';
import { getTeam, type Team } from '../../../games/spades/scoring';
import type { TeamGameState } from '../../../state/gameStore';
import { useSettingsStore } from '../../../state/settingsStore';
import { PLAYER_IDS, TEAM_NAMES } from '../Table/seats';

interface ScoreBoardProps {
  teams: Record<Team, TeamGameState>;
  roundNumber: number;
  winningScore: number;
  onNewGame: () => void;
  /** When a round is in progress, each team also shows its combined bid and tricks won. */
  round?: InteractiveRoundState | null;
}

function teamRoundLine(round: InteractiveRoundState, team: Team): string {
  const players = PLAYER_IDS.filter((id: PlayerId) => getTeam(id) === team);
  const won = players.reduce<number>((sum, id) => sum + round.tricksWonByPlayer[id], 0);
  if (players.some((id) => round.bids[id] === undefined)) return 'Bidding…';
  const bid = players.reduce<number>((sum, id) => sum + (round.bids[id] ?? 0), 0);
  return `Bid ${bid} · Won ${won}`;
}

export function ScoreBoard({ teams, roundNumber, winningScore, onNewGame, round }: ScoreBoardProps) {
  return (
    <header className="panel scoreboard">
      <div className="scoreboard__title">
        <span>
          <span className="scoreboard__logo">♠</span> Trick Tutor
        </span>
        <span className="scoreboard__meta">
          Round {roundNumber} · to {winningScore}
        </span>
      </div>
      <div className="scoreboard__teams">
        {(['A', 'B'] as const).map((team) => (
          <div key={team} className={`team-score team-score--${team}`}>
            <div className="team-score__name">{TEAM_NAMES[team]}</div>
            <div className="team-score__points">{teams[team].points}</div>
            <div className="team-score__bags">
              {teams[team].bags} bag{teams[team].bags === 1 ? '' : 's'}
            </div>
            {round && <div className="team-score__round">{teamRoundLine(round, team)}</div>}
          </div>
        ))}
      </div>
      <div className="scoreboard__actions">
        <SettingsMenu onNewGame={onNewGame} />
        <button type="button" className="button button--quiet scoreboard__new-game" onClick={onNewGame}>
          New game
        </button>
      </div>
    </header>
  );
}

function SettingsMenu({ onNewGame }: { onNewGame: () => void }) {
  const skipBotTurns = useSettingsStore((s) => s.skipBotTurns);
  const setSkipBotTurns = useSettingsStore((s) => s.setSkipBotTurns);
  const showCoaching = useSettingsStore((s) => s.showCoaching);
  const setShowCoaching = useSettingsStore((s) => s.setShowCoaching);

  return (
    <details className="settings">
      <summary className="button button--quiet" aria-label="Settings">
        <span className="settings__label">Settings</span>
        <span className="settings__icon" aria-hidden="true">
          ☰
        </span>
      </summary>
      <div className="settings__panel">
        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={showCoaching}
            onChange={(e) => setShowCoaching(e.target.checked)}
          />
          <span className="switch__track" aria-hidden="true" />
          <span className="switch__label">Coaching tips</span>
        </label>
        <p className="settings__help">Suggested bids and hints about which cards you can play, and why.</p>
        <label className="switch settings__item">
          <input
            type="checkbox"
            role="switch"
            checked={skipBotTurns}
            onChange={(e) => setSkipBotTurns(e.target.checked)}
          />
          <span className="switch__track" aria-hidden="true" />
          <span className="switch__label">Skip bot turns</span>
        </label>
        <p className="settings__help">
          Bots play instantly and finished tricks aren't paused on the table. Check "Last trick" to see what
          happened.
        </p>
        {/* On phones the standalone New game button is hidden, so it lives here. */}
        <button type="button" className="button settings__new-game" onClick={onNewGame}>
          New game
        </button>
      </div>
    </details>
  );
}
