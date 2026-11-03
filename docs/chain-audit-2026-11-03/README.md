# Chain section audit - 2026-11-03

Scope: all 7,086 chains, 5,462 attachment cards, every reference and attachment drawing in the W58 package.

## Fixed in this PR

**Drawings (size, zoom, blur)**
- Drawings were stretched to the card width (min 520 px), so the 500 px catalogue scans were upscaled and looked blurry and zoomed in. They now show at their own pixel size or smaller (max 440 px tall on desktop, 300 px on phones). They are never enlarged.
- Every drawing has a "Zoom drawing" button. It opens a full-screen viewer with "Fit to screen" and "Actual size" options. Escape closes it.

**Reference measurements**
- Drawing letters restored on 2,182 chains whose catalogue drawing is lettered (e.g. WH78: A, B, C, D, E/F, G, H, J). The legend table now has a Letter column. A letter with no published value reads "Confirmed by Uniking on quote".
- Attachment measurements now show:
  - the full Letter / Measurement / in / mm table for every letter on the attachment drawing
  - other published dimensions (bolt hole, lug height, platform width, width over attachments)
  - a status badge on every card: All N / N of M / Key dimensions only / Measurements on quote

**Data corrections** (see `data_corrections.csv`)
- Strand counts were checked against master text and same-family strength ratios. 24 were refuted (set to single strand) and 91 could not be confirmed (label hidden). Real duplex chains such as 80HV-2 and C60-2 were kept.
- UK-36250 pitch mm corrected to 250.0.

**Loader:** new "Apply corrections" button. It updates changed fields in Base44 in place and deletes nothing.

## QA
- 7,086 chains × 4 tabs = 28,344 renders. There were no errors, maker names, em dashes, count mismatches or missing images.
- Browser checks passed 86/86. On desktop and on a 390 px phone, across all 31 groups:
  - no drawing is shown larger than its natural size
  - the zoom viewer works
  - every attachment card shows its measurement status
  - there is no horizontal scroll

## What still blocks 100 %

| Gap | Count | What is needed |
|---|---|---|
| Attachment cards with no published measurements | 3,465 of 5,462 | Maker catalogue PDFs read visually. Maker letters do not mean the same as ours, so the master values cannot be mapped safely. |
| Attachment cards with partial / key-only measurements | 154 / 691 | Same as above |
| Chains on per-chain drawings with no letter mapping | 4,808 | A visual pass to map each drawing's letters |
| Low-resolution reference drawings (about 500 px) | 44 files, including E-N (431 chains), E-R (387), E-I (272) | Better scans from the source catalogues |
| Drawings with ink touching the edge (possibly cropped) | 132 reference, 73 attachment | Re-crop from the source |
| Chains missing pitch / drawing / photo | 160 / 96 / 237 | Source data or Uniking factory input |

Attachment gaps by source family: W58 programme rows 2,875; Webster 502; Tsubaki 485; Rexnord 375; ANSI/ISO 348; Maxco 318; Uniking 2023 189; MAC 113; Renold 98; John King 79; RUD 33; Allied 28; PEER 19. Full detail is in `attachment_measurement_gaps.csv`.

Catalogues to supply, in priority order:
1. Rexnord 5050 / 468B
2. Webster #400
3. Tsubaki engineering class
4. Maxco Red Book
5. Allied-Locke
6. Renold Jeffrey
7. MAC
8. John King
9. 4B

Files: `data_corrections.csv`, `attachment_measurement_gaps.csv`, `drawing_quality.csv`, `chains_missing_data.csv`.
