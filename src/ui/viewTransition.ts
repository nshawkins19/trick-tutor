import { flushSync } from 'react-dom';

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Run a state update inside a View Transition so elements with a matching
 * `view-transition-name` (cards, keyed by id) animate from their old spot to
 * their new one. flushSync makes React commit inside the transition's
 * callback, so the browser snapshots the new DOM. Falls back to a plain
 * update where the API is missing or the user prefers reduced motion.
 */
export function withViewTransition(update: () => void): void {
  if (typeof document === 'undefined' || !document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
