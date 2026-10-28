import { estimateBid } from '../../../games/spades/bidding';
import { HUMAN_PLAYER, MAX_BID, MIN_BID, type InteractiveRoundState } from '../../../games/spades/interactiveRound';
import { PLAYER_IDS, SEATS } from '../Table/seats';

interface BiddingPanelProps {
  round: InteractiveRoundState;
  onBid: (bid: number) => void;
}

const BID_OPTIONS = Array.from({ length: MAX_BID - MIN_BID + 1 }, (_, i) => MIN_BID + i);

export function BiddingPanel({ round, onBid }: BiddingPanelProps) {
  const suggested = estimateBid(round.hands[HUMAN_PLAYER]);
  const partnerBid = round.bids[2];
  const bidsSoFar = PLAYER_IDS.filter((id) => round.bids[id] !== undefined);

  return (
    <div className="bidding">
      <h2 className="bidding__title">How many tricks will you take?</h2>
      <p className="bidding__context">
        {bidsSoFar.length === 0
          ? "You're first to bid."
          : `Bids so far: ${bidsSoFar.map((id) => `${SEATS[id].name} ${round.bids[id]}`).join(', ')}.`}
        {partnerBid !== undefined && ` Your team's bid will be ${partnerBid} + yours.`}
      </p>
      <div className="bidding__options" role="group" aria-label="Choose your bid">
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
      <p className="bidding__hint">
        <strong>Suggested: {suggested}.</strong> Count about one trick for each Ace and King, one for the Q♠, and
        one for every spade beyond your third.
      </p>
    </div>
  );
}
