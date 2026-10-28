import type { Team } from '../../../games/spades/scoring';
import type { TeamGameState } from '../../../state/gameStore';
import { useSettingsStore } from '../../../state/settingsStore';
import { TEAM_NAMES } from '../Table/seats';

interface ScoreBoardProps {
  teams: Record<Team, TeamGameState>;
  roundNumber: number;
  winningScore: number;
  onNewGame: () => void;
}

export function ScoreBoard({ teams, roundNumber, winningScore, onNewGame }: ScoreBoardProps) {
  return (
    <header className="scoreboard">
      <div className="scoreboard__title">
        <span className="scoreboard__logo">♠</span> Trick Tutor
        <span className="scoreboard__meta">
          Round {roundNumber} · first to {winningScore}
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
          </div>
        ))}
      </div>
      <div className="scoreboard__actions">
        <SettingsMenu />
        <button type="button" className="button button--quiet" onClick={onNewGame}>
          New game
        </button>
      </div>
    </header>
  );
}

function SettingsMenu() {
  const skipBotTurns = useSettingsStore((s) => s.skipBotTurns);
  const setSkipBotTurns = useSettingsStore((s) => s.setSkipBotTurns);

  return (
    <details className="settings">
      <summary className="button button--quiet">Settings</summary>
      <div className="settings__panel">
        <label className="switch">
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
      </div>
    </details>
  );
}
