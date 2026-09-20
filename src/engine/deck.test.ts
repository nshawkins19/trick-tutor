import { describe, it, expect } from 'vitest';
import { buildDeck, shuffle } from './deck';

describe('deck', () => {
  it('buildDeck creates 52 unique cards', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
  });

  it('shuffle returns a permutation without mutating the input', () => {
    const original = buildDeck();
    const originalIds = original.map((c) => c.id);
    const shuffled = shuffle(original);
    const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);
    const sortedOriginal = original.toSorted(byId);
    const sortedShuffled = shuffled.toSorted(byId);

    // TODO(human): add assertions here. Check that:
    // 1. `shuffled` is a different array reference than `original`
      expect(original).not.toBe(shuffled);
    // 2. `original` is unchanged (still matches `originalIds`) — shuffle must not mutate its input
      expect(original.map((c) => c.id)).toEqual(originalIds);
    // 3. `shuffled` contains exactly the same 52 cards as `original`, ignoring order
      expect(sortedOriginal).toEqual(sortedShuffled);
    // 4. the order actually changed — think about how to check this without
    //    making the test flaky (a truly random shuffle could in theory
    //    return the original order)
      expect(shuffled.map((c) => c.id)).not.toEqual(originalIds);
  });
});
