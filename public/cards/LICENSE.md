# Card art

**Deck:** "aggie_deck", an original blue-and-gold deck in light and dark versions.
**Source:** provided by the project owner (Nandi Hawkins) on 2026-10-27. Generated with custom Python scripts (`make_deck.py`, `aggie_deck.py`, `aggie_ace.py`, `aggie_people.py`) using school colours and original ornaments and court-card figures, no third-party artwork.
**License:** TODO, choose one (e.g. CC BY 4.0, CC0, or all rights reserved).

## Layout

- `/<suit>-<rank>.svg` is the light set. Ranks are numeric (11 = J, 12 = Q, 13 = K, 14 = A) to match `Card.id`.
- `/dark/<suit>-<rank>.svg` is the dark set, used when the OS is in dark mode.
- `back.svg` and `dark/back.svg` are the card backs.

The original files were named like `A_of_spades.svg` and `card_back.svg` and were renamed on import.
