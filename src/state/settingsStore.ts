import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsStore {
  /** Bots play instantly instead of one move at a time, and finished tricks aren't held on the table. */
  skipBotTurns: boolean;
  setSkipBotTurns: (skip: boolean) => void;
  /** The teacher: suggested bids and "why can't I play that?" hints. */
  showCoaching: boolean;
  setShowCoaching: (show: boolean) => void;
  /** The settings menu is open — the game pauses until it closes. Not persisted. */
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

// Per-browser preferences, kept in localStorage so they survive a reload.
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      skipBotTurns: false,
      setSkipBotTurns: (skip) => set({ skipBotTurns: skip }),
      showCoaching: true,
      setShowCoaching: (show) => set({ showCoaching: show }),
      menuOpen: false,
      setMenuOpen: (open) => set({ menuOpen: open }),
    }),
    {
      name: 'trick-tutor-settings',
      storage: createJSONStorage(() => localStorage),
      // Only real preferences survive a reload; an open menu shouldn't.
      partialize: ({ skipBotTurns, showCoaching }) => ({ skipBotTurns, showCoaching }),
    }
  )
);
