import type { Card as CardModel } from '../../../engine/types';
import { Card } from '../Card/Card';
import { sortHand } from './sortHand';

interface HandProps {
  cards: CardModel[];
  /** Cards that may be played now. Omit (with onPlay) for a display-only hand. */
  legal?: CardModel[];
  onPlay?: (card: CardModel) => void;
}

export function Hand({ cards, legal, onPlay }: HandProps) {
  const isLegal = (card: CardModel) => legal?.some((c) => c.id === card.id) ?? false;

  return (
    <div className="hand" role="group" aria-label="Your hand">
      {sortHand(cards).map((card) => (
        <Card
          key={card.id}
          card={card}
          onPlay={onPlay}
          disabled={onPlay ? !isLegal(card) : false}
          animate
        />
      ))}
    </div>
  );
}
