import type { PlayerId, Trick, TrickPlay } from '../../../engine/types';
import type { InteractiveRoundState } from '../../../games/spades/interactiveRound';
import { Card, CardBack } from '../Card/Card';
import { PLAYER_IDS, SEATS } from './seats';

function bidText(round: InteractiveRoundState, playerId: PlayerId): string {
  const bid = round.bids[playerId];
  if (bid !== undefined) return `Bid ${bid} · Won ${round.tricksWonByPlayer[playerId]}`;
  if (round.phase === 'bidding' && round.currentPlayer === playerId) return 'Bidding…';
  return 'No bid yet';
}

function SeatBadge({ round, playerId }: { round: InteractiveRoundState; playerId: PlayerId }) {
  const seat = SEATS[playerId];
  const isTurn = round.currentPlayer === playerId;
  const cardCount = round.hands[playerId].length;
  const isBot = playerId !== 0;

  return (
    <div
      className={`seat seat--${seat.position}${isTurn ? ' seat--active' : ''}`}
      aria-current={isTurn ? 'true' : undefined}
    >
      <div className="seat__name">
        {seat.name}
        <span className={`chip chip--team-${seat.team}`}>Team {seat.team}</span>
        {round.dealerId === playerId && <span className="chip chip--dealer">Dealer</span>}
      </div>
      <div className="seat__bid">{bidText(round, playerId)}</div>
      {isBot && (
        <div className="seat__cards" aria-label={`${cardCount} cards`}>
          <div className="seat__fan">
            {Array.from({ length: cardCount }, (_, i) => (
              <CardBack key={i} size="sm" />
            ))}
          </div>
          <span className="seat__count">{cardCount}</span>
        </div>
      )}
    </div>
  );
}

function TrickCards({
  plays,
  size,
  winnerId = null,
}: {
  plays: TrickPlay[];
  size: 'sm' | 'md';
  winnerId?: PlayerId | null;
}) {
  return (
    <>
      {plays.map((play) => {
        const position = SEATS[play.playerId].position;
        const winner = play.playerId === winnerId ? ' trick__slot--winner' : '';
        return (
          <div key={play.card.id} className={`trick__slot trick__slot--${position}${winner}`}>
            <Card card={play.card} size={size} animate enterFrom={position} />
          </div>
        );
      })}
    </>
  );
}

function CurrentTrick({ round, heldTrick }: { round: InteractiveRoundState; heldTrick: Trick | undefined }) {
  const plays = heldTrick ? heldTrick.plays : round.currentTrickPlays;
  let prompt: string | null = null;
  if (round.phase === 'bidding') prompt = 'Bidding';
  else if (plays.length === 0) prompt = round.currentPlayer === 0 ? 'Your lead' : `${SEATS[round.currentPlayer].name} leads`;

  return (
    <div className="trick" aria-label="Current trick">
      <TrickCards plays={plays} size="md" winnerId={heldTrick?.winnerId} />
      {prompt && <div className="trick__prompt">{prompt}</div>}
    </div>
  );
}

function LastTrick({ trick }: { trick: Trick | undefined }) {
  return (
    <div className="last-trick" aria-label="Last trick">
      <div className="last-trick__title">Last trick</div>
      {trick ? (
        <>
          <div className="trick trick--mini">
            <TrickCards plays={trick.plays} size="sm" />
          </div>
          <div className="last-trick__winner">
            {trick.winnerId !== null && `${SEATS[trick.winnerId].name} won`}
          </div>
        </>
      ) : (
        <div className="last-trick__empty">None yet</div>
      )}
    </div>
  );
}

interface TableProps {
  round: InteractiveRoundState;
  /**
   * True while the just-finished trick is held in the center so it can be
   * seen; "Last trick" then shows the one before it, so no card is on screen twice.
   */
  holdingTrick?: boolean;
}

export function Table({ round, holdingTrick = false }: TableProps) {
  const tricksPlayed = round.completedTricks.length;
  const heldTrick = holdingTrick ? round.completedTricks[tricksPlayed - 1] : undefined;
  const lastTrick = round.completedTricks[tricksPlayed - (holdingTrick ? 2 : 1)];

  return (
    <div className="table">
      <div className="table__info">
        <div>
          Trick {Math.min(tricksPlayed + (holdingTrick ? 0 : 1), 13)} of 13
        </div>
        <div className={`chip ${round.spadesBroken ? 'chip--broken' : ''}`}>
          ♠ {round.spadesBroken ? 'broken' : 'not broken'}
        </div>
      </div>
      {PLAYER_IDS.map((id) => (
        <SeatBadge key={id} round={round} playerId={id} />
      ))}
      <CurrentTrick round={round} heldTrick={heldTrick} />
      <LastTrick trick={lastTrick} />
    </div>
  );
}
