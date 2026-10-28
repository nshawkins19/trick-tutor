# 007 — Coaching tips setting

**Status:** done

## Goal

Let players who don't want the teacher turn it off.

## Design

- `useSettingsStore.showCoaching` (default `true`, saved with the other settings in localStorage) is switched by **Coaching tips** in the Settings / ☰ menu.
- When it's off:
  - The bidding panel has no suggested-bid highlight and no "Suggested: N…" explanation, and the collapsed pill just says "Your bid".
  - The status line says "Your lead." / "Your turn." instead of the `explainLegalPlays` sentence.
- Still shown with coaching off: illegal cards stay dimmed, because the rules are enforced regardless, and bots' turns, trick results, and scores are unchanged.
- Future coaching features (`CoachTip`, lessons) should check the same flag.

## Acceptance criteria

- **AC-1** Turning Coaching tips off replaces the legal-play hint with "Your turn." / "Your lead.", and turning it back on restores it.
- **AC-2** With coaching off, the bidding panel shows no suggested bid anywhere.
- **AC-3** The setting survives a reload.
