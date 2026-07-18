# Where this data came from

Provenance for `districts.json` and `shelters.json`. Both are plain arrays/objects
consumed directly by the app, so the notes live here rather than inside the JSON.

Retrieved **2026-07-18**.

## districts.json

Coordinates are district headquarters. `controlRoom` numbers are the district
emergency control rooms issued by Odisha's Special Relief Commissioner for
Cyclone Dana (October 2024), cross-checked against two independent reports that
agree line for line.

| District | Control room |
|---|---|
| Puri | 06752-223237 |
| Kendrapara | 06727-232803 |
| Jagatsinghpur | 06724-220368 |
| Balasore | 06782-262286 (also 06782-261077) |
| Bhadrak | 06784-251881 |
| Ganjam | 06811-263978 |
| Khordha | 06755-220002 |

Also verified, not currently surfaced in the UI:

- **1077** — state toll-free, routes to the caller's district control room
- **0674-2534177**, **7682982668** — State Emergency Operation Centre
- 100 / 101 / 108 confirmed against the Odisha government emergency page

**These are reissued per cyclone event.** Re-verify against the SRC's current
advisory before each season rather than trusting this table indefinitely.

## shelters.json

699 shelters pulled from the **OSDMA Multi Purpose Cyclone/Flood Shelters**
registry — <https://www.osdma.org/preparedness/multi-purpose-cyclone-flood-shelters/>

The page server-renders its map markers into a `var shelters1 = [...]` array,
one entry per shelter with the registry's own coordinates. Every field below is
copied from there; nothing is inferred.

| District | Shelters |
|---|---|
| Puri | 177 |
| Balasore | 144 |
| Kendrapara | 117 |
| Bhadrak | 103 |
| Ganjam | 102 |
| Khordha | 51 |
| Jagatsinghpur | 5 |

Sanity checks that passed: no coordinate falls outside Odisha's bounding box,
and no shelter sits more than 86 km from its own district headquarters.

### Known problems in the upstream registry

- **No capacity anywhere.** OSDMA does not publish it in this dataset, so no
  capacity is stored. The UI previously showed figures like "Capacity 1,200" —
  those were invented placeholders and are gone. Do not reintroduce a capacity
  number without a source you can cite.
- **Jagatsinghpur returns only 5 shelters.** The district is one of the most
  cyclone-exposed in the state and certainly has more; the upstream registry is
  incomplete. This is not a scraping bug — the source genuinely returns 5.
- **One mislabelled block.** The Ganjam row "Kesapur" carries block
  `Balasore Sadar`. Its coordinates (19.61, 85.13) are inside Ganjam, so trust
  the coordinates and not that label.
- **`name` is a village/site label, not a formal shelter name.** Registry values
  are ALL CAPS and were title-cased for display; the identity is unchanged.
- **Block spelling was inconsistent.** Puri listed both `BRAMHAGIRI` (32 rows)
  and `BRAHMAGIRI` (1 row) for the same block; folded to `Brahmagiri`.

### Before this goes public

The registry is a starting point, not a clearance. Confirm with district
emergency offices that the shelters are currently open and usable — a building
in the registry is not proof it is staffed, stocked, or standing.
