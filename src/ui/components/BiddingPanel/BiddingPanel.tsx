import { estimateBid } from '../../../games/spades/bidding';
import { HUMAN_PLAYER, MAX_BID, MIN_BID, type InteractiveRoundState } from '../../../games/spades/interactiveRound';
import { PLAYER_IDS, SEATS } from '../Table/seats';

interface BiddingPanelProps {
  round: InteractiveRoundState;
  onBid: (bid: number) => void;
  /** Collapsed shows just a small "Your bid" pill so the table and your hand are visible. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Show the suggested bid and how it was worked out. */
  coaching: boolean;
}

const BID_OPTIONS = Array.from({ length: MAX_BID - MIN_BID + 1 }, (_, i) => MIN_BID + i);

export function BiddingPanel({ round, onBid, collapsed, onToggleCollapsed, coaching }: BiddingPanelProps) {
  const suggested = coaching ? estimateBid(round.hands[HUMAN_PLAYER]) : null;

  if (collapsed) {
    return (
      <button type="button" className="bidding-pill" onClick={onToggleCollapsed} aria-expanded="false">
        Your bid{suggested !== null && ` · suggested ${suggested}`} <span aria-hidden="true">▴</span>
      </button>
    );
  }

  const partnerBid = round.bids[2];
  const bidsSoFar = PLAYER_IDS.filter((id) => round.bids[id] !== undefined);

  return (
    <div className="bidding" role="dialog" aria-label="Choose your bid">
      <div className="bidding__header">
        <h2 className="bidding__title">How many tricks will you take?</h2>
        <button
          type="button"
          className="bidding__collapse"
          onClick={onToggleCollapsed}
          aria-expanded="true"
          aria-label="Hide bidding panel"
          title="Hide to see the table"
        >
          Hide <span aria-hidden="true">▾</span>
        </button>
      </div>
      <p className="bidding__context">
        {bidsSoFar.length === 0
          ? "You're first to bid."
          : `Bids so far: ${bidsSoFar.map((id) => `${SEATS[id].name} ${round.bids[id]}`).join(', ')}.`}
        {partnerBid !== undefined && ` Your team's bid will be ${partnerBid} + yours.`}
      </p>
      <div className="bidding__options" role="group" aria-label="Bid amount">
        {BID_OPTIONS.map((bid) => (
          <button
            key={bid}
            type="button"
            className={`bid-button${bid === suggested ? ' bid-button--suggested' : ''}`}
            onClick={() => onBid(bid)}
          >
            {bid}
          </button>
        ))}
      </div>
      {suggested !== null && (
        <p className="bidding__hint">
          <strong>Suggested: {suggested}.</strong> Count about one trick for each Ace and King, one for the Q♠, and
          one for every spade beyond your third.
        </p>
      )}
    </div>
  );
}
