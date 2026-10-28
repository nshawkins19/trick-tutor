import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsStore {
  /** Bots play instantly instead of one move at a time, and finished tricks aren't held on the table. */
  skipBotTurns: boolean;
  setSkipBotTurns: (skip: boolean) => void;
}

// Per-browser preferences, kept in localStorage so they survive a reload.
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      skipBotTurns: false,
      setSkipBotTurns: (skip) => set({ skipBotTurns: skip }),
    }),
    {
      name: 'trick-tutor-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
