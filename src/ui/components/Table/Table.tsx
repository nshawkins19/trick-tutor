import type { ReactNode } from 'react';
import type { PlayerId, Trick, TrickPlay } from '../../../engine/types';
import type { InteractiveRoundState } from '../../../games/spades/interactiveRound';
import { Card, CardBack } from '../Card/Card';
import { PLAYER_IDS, SEATS } from './seats';

function bidText(round: InteractiveRoundState, playerId: PlayerId): ReactNode {
  const bid = round.bids[playerId];
  if (bid !== undefined) {
    // Two pieces so a narrow seat can wrap "Bid 4" / "Won 1" onto separate lines.
    return (
      <>
        <span>Bid {bid}</span>
        <span className="seat__bid-sep" aria-hidden="true">
          ·
        </span>
        <span>Won {round.tricksWonByPlayer[playerId]}</span>
      </>
    );
  }
  if (round.phase === 'bidding' && round.currentPlayer === playerId) return 'Bidding…';
  return 'No bid yet';
}

/**
 * One slot per trick in the bid: filled when won, dashed while still needed.
 * Tricks won beyond the bid (bags) get their own color.
 */
function WonPile({ bid, won }: { bid: number | undefined; won: number }) {
  if (bid === undefined) return null;
  const slots = Math.max(bid, won);
  if (slots === 0) return null;

  return (
    <div className="won-pile" aria-label={`Won ${won} of ${bid} bid`}>
      {Array.from({ length: slots }, (_, i) => {
        let state = 'needed';
        if (i < won) state = i < bid ? 'won' : 'bag';
        return <span key={i} className={`won-pile__slot won-pile__slot--${state}`} />;
      })}
    </div>
  );
}

function SeatBadge({ round, playerId }: { round: InteractiveRoundState; playerId: PlayerId }) {
  const seat = SEATS[playerId];
  const isTurn = round.currentPlayer === playerId && !round.roundOver;
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
      <WonPile bid={round.bids[playerId]} won={round.tricksWonByPlayer[playerId]} />
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

export function TrickCards({
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

interface TableProps {
  round: InteractiveRoundState;
  /**
   * True while the just-finished trick is held in the center so it can be
   * seen (the side panel's "Last trick" then shows the one before it, so no
   * card is on screen twice).
   */
  holdingTrick?: boolean;
  /** Floats over the middle of the felt — used for the bidding panel. */
  overlay?: ReactNode;
  /**
   * Round status for the felt's empty top corners. Only shown on phones in
   * portrait, where there's no room for the side panel's copy.
   */
  corners?: ReactNode;
}

export function Table({ round, holdingTrick = false, overlay, corners }: TableProps) {
  const tricksPlayed = round.completedTricks.length;
  const heldTrick = holdingTrick ? round.completedTricks[tricksPlayed - 1] : undefined;

  return (
    <div className="table">
      {PLAYER_IDS.map((id) => (
        <SeatBadge key={id} round={round} playerId={id} />
      ))}
      <CurrentTrick round={round} heldTrick={heldTrick} />
      {corners && <div className="table__corners">{corners}</div>}
      {overlay && <div className="table__overlay">{overlay}</div>}
    </div>
  );
}
