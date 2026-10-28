import type { RoundHistoryEntry } from '../../../state/gameStore';
import { Card } from '../Card/Card';
import { PLAYER_IDS, SEATS, TEAM_NAMES } from '../Table/seats';

export function RoundSummary({ entry, roundNumber }: { entry: RoundHistoryEntry; roundNumber: number }) {
  return (
    <section className="summary" aria-label={`Round ${roundNumber} summary`}>
      <h2>Round {roundNumber} results</h2>

      <div className="summary__teams">
        {(['A', 'B'] as const).map((team) => {
          const score = entry.roundScore[team];
          const made = score.tricksWon >= score.bid;
          return (
            <div key={team} className="summary__team">
              <div className="summary__team-name">{TEAM_NAMES[team]}</div>
              <div>
                Bid {score.bid}, won {score.tricksWon}
                {score.bags > 0 && `, ${score.bags} bag${score.bags === 1 ? '' : 's'}`}
              </div>
              <div className={made ? 'summary__points--made' : 'summary__points--set'}>
                {made ? 'Made it' : 'Set'}: {score.points > 0 ? '+' : ''}
                {score.points}
              </div>
            </div>
          );
        })}
      </div>

      <table className="summary__players">
        <thead>
          <tr>
            <th scope="col">Player</th>
            <th scope="col">Bid</th>
            <th scope="col">Won</th>
          </tr>
        </thead>
        <tbody>
          {PLAYER_IDS.map((id) => (
            <tr key={id}>
              <th scope="row">{SEATS[id].name}</th>
              <td>{entry.bids[id]}</td>
              <td>{entry.tricksWonByPlayer[id]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <details className="summary__log">
        <summary>Trick-by-trick log</summary>
        <ol>
          {entry.completedTricks.map((trick, i) => (
            <li key={i} className="summary__trick">
              {trick.plays.map((play) => (
                <div
                  key={play.card.id}
                  className={`summary__play${play.playerId === trick.winnerId ? ' summary__play--winner' : ''}`}
                >
                  <Card card={play.card} size="sm" />
                  <span>{SEATS[play.playerId].name}</span>
                </div>
              ))}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
