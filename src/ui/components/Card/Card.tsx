import { useState, type CSSProperties } from 'react';
import type { Card as CardModel } from '../../../engine/types';
import {
  CARD_IMAGES_AVAILABLE,
  cardBackPath,
  cardImagePath,
  cardLabel,
  isRedSuit,
  rankLabel,
  suitSymbol,
} from './cardAssets';
import './card.css';

type CardSize = 'sm' | 'md';

/** Where a card slides in from when it appears with nothing to morph from. */
export type CardEnterFrom = 'deck' | 'left' | 'top' | 'right' | 'bottom';

interface CardProps {
  card: CardModel;
  size?: CardSize;
  disabled?: boolean;
  /** Present → the card is a clickable <button>; absent → display-only. */
  onPlay?: (card: CardModel) => void;
  /**
   * Give the card a view-transition-name (keyed by card id) so it animates
   * between places on screen. Only one animated copy of a card may be in the
   * DOM at once, so leave it off for logs and summaries.
   */
  animate?: boolean;
  enterFrom?: CardEnterFrom;
}

function transitionStyle(card: CardModel, enterFrom: CardEnterFrom): CSSProperties {
  // view-transition-class isn't in React's CSS types yet.
  return {
    viewTransitionName: `card-${card.id}`,
    viewTransitionClass: `card-move from-${enterFrom}`,
  } as CSSProperties;
}

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

/** Light/dark card art via <picture>; calls onError if the image is missing. */
function CardPicture({ light, dark, onError }: { light: string; dark: string; onError: () => void }) {
  return (
    <picture className="card__picture">
      <source media={DARK_MODE_QUERY} srcSet={dark} />
      <img className="card__image" src={light} alt="" draggable={false} onError={onError} />
    </picture>
  );
}

function CardFace({ card }: { card: CardModel }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (CARD_IMAGES_AVAILABLE && !imageFailed) {
    return (
      <CardPicture
        light={cardImagePath(card)}
        dark={cardImagePath(card, 'dark')}
        onError={() => setImageFailed(true)}
      />
    );
  }

  const rank = rankLabel(card);
  const suit = suitSymbol(card.suit);
  return (
    <span className="card__face" aria-hidden="true">
      <span className="card__corner card__corner--top">
        {rank}
        <br />
        {suit}
      </span>
      <span className="card__pip">{suit}</span>
      <span className="card__corner card__corner--bottom">
        {rank}
        <br />
        {suit}
      </span>
    </span>
  );
}

export function Card({ card, size = 'md', disabled = false, onPlay, animate = false, enterFrom = 'deck' }: CardProps) {
  const style = animate ? transitionStyle(card, enterFrom) : undefined;
  const className = [
    'card',
    `card--${size}`,
    isRedSuit(card.suit) ? 'card--red' : 'card--black',
    onPlay && !disabled ? 'card--playable' : '',
    disabled ? 'card--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (onPlay) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        disabled={disabled}
        aria-label={cardLabel(card)}
        onClick={() => onPlay(card)}
      >
        <CardFace card={card} />
      </button>
    );
  }

  return (
    <div className={className} style={style} role="img" aria-label={cardLabel(card)}>
      <CardFace card={card} />
    </div>
  );
}

/** A face-down card. Takes no Card, so a hidden hand can't leak into the DOM. */
export function CardBack({ size = 'md' }: { size?: CardSize }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`card card--${size} card--back`} role="img" aria-label="Face-down card">
      {CARD_IMAGES_AVAILABLE && !imageFailed ? (
        <CardPicture light={cardBackPath()} dark={cardBackPath('dark')} onError={() => setImageFailed(true)} />
      ) : (
        <span className="card__back-pattern" aria-hidden="true" />
      )}
    </div>
  );
}
