# Stage 0 Equivalency Ambiguity Report
## Unresolved Cross-Reference & Interchangeability Issues

**Status:** Issues Identified | Awaiting Clarification for Stage 1  
**Date:** 2026-05-06

---

## CRITICAL AMBIGUITIES

### AMBIGUITY 1: WH78 / WH78-4 Pitch Discrepancy ⚠️ CRITICAL

**Issue:** Allied-Locke documents two pitch versions for same base chain.

**Conflicting Data:**
- WH78 standard: pitch 2.609" (66.27 mm) — documented in alliedLockeSourceRecord.js
- WH78-4: pitch 4.000" (101.60 mm) — documented as "WH78 components at 4\" pitch"
- ASME B29.100 baseline: pitch 4.063" (103.19 mm) for WH124

**Problem:**
```
Delta(WH78-4 vs ASME baseline) = |101.60 - 103.19| = 1.59 mm
Tolerance(Welded Steel) = ±0.75 mm
1.59 mm > 0.75 mm → EXCEEDS TOLERANCE
```

**Questions for User:**
1. Is WH78-4 a documented variant or data entry error?
2. What is the correct pitch for WH78-4 (4.000" or 4.063")?
3. Is WH78-4 an extended-pitch variant or separate chain series?

**Impact:** Cannot normalize without clarification. Flag both entries as "needs_review".

**Recommendation:** Obtain latest Allied-Locke catalog to verify.

---

### AMBIGUITY 2: Double Pitch Conveyor — C2042 "Large Roller" Designation

**Issue:** Donghua introduces C2042/C2052/C2062 as "large roller" variants. Unclear if these are separate chains or options of base C2040/C2050/C2060.

**Data:**
- C2040: roller_dia = 0.312" (standard size)
- C2042: roller_dia = 0.440" (described as "large roller variant")
- Same pitch (1.000"), same tensile (3,700 lbs)

**Problem:** Is C2042 a **variant** (option on base chain) or a **distinct normalized_id**?

**Evidence for Variant:**
- Same pitch
- Same tensile strength
- Only difference: roller size
- Donghua refers to it as "C2042 — large roller version of C2040"

**Evidence for Distinct ID:**
- Different OD (affects sprocket compatibility)
- Different assembly (larger rollers change geometry)
- Listed separately in catalog
- Users selecting "C2040" expect standard roller size

**Questions for User:**
1. Should C2042 be grouped under C2040 or as separate normalized_id?
2. Are roller-size variants considered "engineering changes" (separate IDs) or "design options" (variants)?
3. How should UX handle this: one "C2040" with roller-size dropdown, or separate "C2040" + "C2042" entries?

**Recommendation:** Review how Rexnord/Tsubaki handle this pattern. If they offer equivalent large-roller options, follow their naming convention.

---

### AMBIGUITY 3: Heavy Series Sidebar Thickness Variance

**Issue:** ANSI-40 vs ANSI-40H have same pitch/roller diameter, but sidebar thickness differs. Document doesn't specify exact thickness measurements.

**Data:**
- ANSI-40: sidebar height 0.720" (standard)
- ANSI-40H: sidebar height 0.720" (same per ANSI B29.1)
- **But:** Heavy series uses thicker plate stock (not captured in height dimension)

**Problem:** How are "Heavy" series distinguished if height dimension is identical?

**Possible Answers:**
1. Thickness (width of plate material) differs, not height
2. Material hardness differs (heat treatment)
3. Multiple thickness options within same height class
4. ANSI spec incomplete; actual AL/Tsubaki specs vary

**Questions for User:**
1. Is "Heavy" series distinction primarily **material thickness** (plate width), **hardness**, or **both**?
2. Should we capture `plate_thickness` dimension separately from `sidebar_height`?
3. Do Tier 1 manufacturers document exact thickness specs?

**Recommendation:** Obtain detailed AL/Tsubaki engineering drawings for ANSI-40 vs ANSI-40H comparison.

---

### AMBIGUITY 4: Stainless Steel Tensile Derating — Confidence & Consistency

**Issue:** Donghua documents 3–8% tensile loss for 304SS, but data is sparse and ranges are wide.

**Data:**
```
Base Tensile | 304SS Tensile | Derating | Source
925 lbs      | 850 lbs       | -8%      | Donghua
3,700 lbs    | 3,500 lbs     | -5%      | Donghua
8,500 lbs    | 8,000 lbs     | -6%      | Donghua
14,500 lbs   | 14,000 lbs    | -3%      | Donghua
```

**Problem:**
1. No Tier 1 source (Tsubaki) documents stainless specs
2. Donghua is only source; confidence = "medium"
3. Derating percentage varies (3–8%) with no clear pattern
4. Unclear if variation is due to heat treatment, manufacturing process, or testing variance

**Questions for User:**
1. Should we use **single average derating** (5%) or **per-chain specific values**?
2. Can we obtain Tier 1 (Tsubaki) stainless specs for validation?
3. Is derating primarily affected by **tensile strength baseline** (larger chains derate less)?
4. Should 304SS and 316SS have different derating factors?

**Impact:** Cannot confidently assign tensile values for stainless chains without Tier 1 data.

**Recommendation:** Contact Tsubaki for stainless certification docs; flag all Donghua stainless specs as "confidence: medium" with "needs_review" until Tier 1 source available.

---

## MODERATE AMBIGUITIES

### AMBIGUITY 5: Welded Steel — Extended Pitch Variants

**Issue:** Allied-Locke documents WH78-4 as extended pitch variant. Unclear if other welded chains have extended pitch options.

**Data:**
```
Standard: WH78 (2.609" pitch), WH82 (3.075"), WH124 (4.000")
Extended: WH78-4 (4.000" pitch???)
```

**Problem:** Is WH78-4 a standard extended-pitch option or rare variant? Do other WH sizes have extended versions?

**Questions:**
1. What is the complete list of extended-pitch welded chains?
2. Should extended-pitch variants be separate normalized_ids or material-options under base chains?

**Recommendation:** Review full AL welded chain catalog; document pattern for all extended variants.

---

### AMBIGUITY 6: Specialty Agricultural Chains — CA625 vs CA550 Relationship

**Issue:** Donghua introduces CA625 as "heavy agricultural variant". Unclear relationship to CA550 baseline.

**Data:**
- CA550: pitch 1.654", tensile 16,000 lbs
- CA625: pitch 1.972", tensile 24,000 lbs (different pitch)

**Problem:** Different pitch = different chain, not variant. But called "variant" in catalog description.

**Classification:**
- If pitch differs → **Separate normalized_id** (not variant)
- If pitch same, tensile differs → Variant or tier

**Recommendation:** Apply Rule from Authority Resolution: pitch determines equivalency. CA625 is separate ID.

---

### AMBIGUITY 7: Escalator Step Chains — EN 115 vs Custom

**Issue:** ESC-133mm and ESC-147mm chains documented per EN 115 standard. Unclear if these are international standard or Donghua-specific.

**Data:**
- ESC-133: pitch 5.236" (133.00 mm), per EN 115 / ISO 22559
- ESC-147: pitch 5.787" (147.00 mm), per EN 115 / ISO 22559

**Problem:** Tsubaki/Allied-Locke don't document escalator chains in analyzed files. Only Donghua provides specs.

**Authority:** Tier 3 (Donghua) only source. Confidence = "medium".

**Questions:**
1. Are escalator step chains considered "out of scope" for ANSI-focused catalog?
2. Should these use separate authority rules (EN 115 instead of ANSI baseline)?

**Recommendation:** Confirm escalator chains in scope for migration; verify Tier 1 source existence.

---

## LOW-PRIORITY AMBIGUITIES

### AMBIGUITY 8: Donghua BS/ISO Chains — Interchangeability with ANSI

**Issue:** Donghua documents BS/ISO B-series chains (BS-04B, BS-12B, etc.) as ISO 606 / BS 228 compliant. But specs often differ from ANSI equivalents.

**Example:**
- BS-12B: pitch 0.750" (same as ANSI-60)
- BS-12B tensile: 6,500 lbs (vs ANSI-60 8,500 lbs)

**Problem:** Are these equivalent (just different standard) or separate chains?

**Normalized Decision:** ISO 606 is separate standard; create separate normalized_ids for BS- series. Do NOT merge into ANSI equivalents.

**Rationale:** Pitch may be close but geometry differs; tensile ratings differ significantly. Merger would lose critical data.

---

### AMBIGUITY 9: Tsubaki "Lambda" vs "Neptune" Series — Premium Tier Definition

**Issue:** Minimal data on Tsubaki premium series (Lambda, Neptune, Titan, etc.). Unclear if these are separate products or performance tiers.

**Data:**
- ANSI-80 Lambda: tensile 20,000 lbs (vs standard 14,500 lbs, delta +38%)
- ANSI-80 Neptune: data sparse or unavailable
- ANSI-80 Titan: data sparse or unavailable

**Problem:** Insufficient Tier 1 source data to define premium tier structure.

**Impact:** Create separate IDs for documented premium variants (Lambda); mark undocumented variants as "needs_review".

**Recommendation:** Obtain Tsubaki premium series catalog for complete specification.

---

## AMBIGUITY SUMMARY TABLE

| Ambiguity | Category | Severity | Data Source | Confidence | Action |
|-----------|----------|----------|-------------|-----------|--------|
| WH78 pitch | Critical | **BLOCKS** | AL | Low | **Needs clarification** |
| C2042 variant | Critical | **Decision needed** | Donghua | Medium | **Design decision** |
| ANSI-40H thickness | High | Affects ID distinction | ANSI B29.1 | Medium | **Needs spec details** |
| SS derating | High | Affects 6 chains | Donghua | Medium | **Needs Tier 1 source** |
| WH extended pitch | Moderate | Incomplete pattern | AL | Medium | **Catalog review** |
| CA625 classification | Moderate | Rename/reclassify | Donghua | Medium | **Apply rules** |
| Escalator scope | Low | Out-of-spec | EN 115 | Medium | **Confirm scope** |
| BS/ISO vs ANSI | Low | Classification | Donghua | High | **Use separate IDs** |
| Tsubaki premium series | Low | Missing data | Tsubaki | Low | **Catalog sourcing** |

---

## RECOMMENDATIONS FOR STAGE 1

### Must Resolve Before Stage 1:
1. **WH78 pitch discrepancy** — obtain AL clarification
2. **C2042 variant classification** — decide variant vs. separate ID strategy
3. **Stainless derating** — source Tier 1 specs or flag all as "medium" confidence

### Can Proceed with Flags:
1. ANSI-40H thickness measurement — document as incomplete, flag for review
2. Extended pitch variants — create separate IDs per rule; document pattern
3. Escalator chains — include if in scope; flag Tier 3 authority only
4. BS/ISO chains — create separate normalized_ids; do not merge with ANSI

### For Stage 2 Sourcing:
1. Tsubaki premium series (Lambda, Neptune, Titan) — obtain full catalog
2. Welded chain extended variants — complete AL documentation
3. Speed specs — ALL families missing; obtain from catalogs
4. Live product images — obtain photography/scans for key chains

---

**Status:** 9 ambiguities identified. 3 critical, 4 moderate, 2 low-priority.  
**Escalation:** Awaiting user clarification on WH78 pitch and C2042 classification before Stage 1 start.