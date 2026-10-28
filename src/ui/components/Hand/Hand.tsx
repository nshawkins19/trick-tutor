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
  const sorted = sortHand(cards);
  // Two rows so tall phones can stack the hand; elsewhere CSS flattens them
  // (display: contents) into one fanned line.
  const split = Math.ceil(sorted.length / 2);
  const rows = [sorted.slice(0, split), sorted.slice(split)];

  return (
    <div className="hand" role="group" aria-label="Your hand">
      {rows.map((row, i) => (
        <div key={i} className="hand__row">
          {row.map((card) => (
            <Card
              key={card.id}
              card={card}
              onPlay={onPlay}
              disabled={onPlay ? !isLegal(card) : false}
              animate
            />
          ))}
        </div>
      ))}
    </div>
  );
}
