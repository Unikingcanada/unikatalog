# PKG-01 Tsubaki — working dir

Status: **BLOCKED on inputs.** Extraction (PKG-01e + PKG-01f) cannot run yet.

## Ready (done offline)
- `compile_workbook.py` — copied here; `BANNED` tuple updated per PKG-01f addendum
  (lambda, neptune, xceeder, x-ceeder, titan, titanxl, speed master, speedmaster,
  iron hawk, ironhawk, shuttle hawk, shuttlehawk, sj3, sj2). Validator confirmed
  runnable (pandas 3.0.3). ⚠ substring match flags "titanium" via "titan" — switch
  to word-boundary before running on real data.
- `CANONICAL_HEADER.csv` — 62-column header reconstructed from the compiler's
  required fields. Use until the real `PKG-01_tsubaki_rf_conveyor_chains.csv` arrives.

## Blocked — needed to proceed
1. **Source PDFs** (sandbox denies all egress — `403 host_not_allowed`):
   - ECD General Catalog L10950 (24 MB) — PKG-01e, all 12 sections
   - Small-Size Conveyor Chain (29 MB) — PKG-01f Job B
   - Large-Size Conveyor Chain (33 MB) — PKG-01f Job C
   - `catalog.tsubaki.ca` web listings — PKG-01f Job A (leaf chains)
2. **Missing data files** (not in uploads, referenced by spec):
   - `PKG-01_tsubaki_rf_conveyor_chains.csv` (canonical header)
   - `PKG-01f_leaf_chains_BL_part1.csv` (BL422–BL1022, Job A input)

## Unblock (either)
- **Allow `tsubaki.ca` + `catalog.tsubaki.ca` in the environment egress policy**
  → I download/scrape directly (Drive not needed; PDF URLs are public). Still need
  the 2 CSVs above (drag in — they're small).
- **Or drag all files into chat** (proven this session). 24 MB PDF may hit the
  upload limit; if so, attach one at a time or split.
