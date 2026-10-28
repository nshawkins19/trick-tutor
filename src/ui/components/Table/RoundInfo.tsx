import type { Trick } from '../../../engine/types';
import type { InteractiveRoundState } from '../../../games/spades/interactiveRound';
import { SEATS } from './seats';
import { TrickCards } from './Table';

function LastTrick({ trick }: { trick: Trick | undefined }) {
  return (
    <section className="panel last-trick" aria-label="Last trick">
      <h3 className="panel__title">Last trick</h3>
      {trick ? (
        <>
          <div className="trick trick--mini">
            <TrickCards plays={trick.plays} size="sm" winnerId={trick.winnerId} />
          </div>
          <div className="last-trick__winner">
            {trick.winnerId !== null && (trick.winnerId === 0 ? 'You won' : `${SEATS[trick.winnerId].name} won`)}
          </div>
        </>
      ) : (
        <div className="last-trick__empty">None yet</div>
      )}
    </section>
  );
}

/** Side-panel round status: trick count, spades broken, and the last finished trick. */
export function RoundInfo({ round, holdingTrick }: { round: InteractiveRoundState; holdingTrick: boolean }) {
  const tricksPlayed = round.completedTricks.length;
  const trickNumber = Math.min(tricksPlayed + (holdingTrick ? 0 : 1), 13);
  // While a trick is held in the center, show the one before it here.
  const lastTrick = round.completedTricks[tricksPlayed - (holdingTrick ? 2 : 1)];

  return (
    <>
      <section className="panel round-info" aria-label="Round status">
        <span>
          {round.phase === 'bidding' ? 'Bidding' : `Trick ${trickNumber} of 13`}
        </span>
        <span className={`chip ${round.spadesBroken ? 'chip--broken' : 'chip--quiet'}`}>
          ♠ {round.spadesBroken ? 'broken' : 'not broken'}
        </span>
      </section>
      <LastTrick trick={lastTrick} />
    </>
  );
}
