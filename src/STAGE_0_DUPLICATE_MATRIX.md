# Stage 0 Duplicate Matrix
## Duplicate Entry Analysis & Consolidation Assessment

**Status:** Analysis Only | No Consolidation Applied  
**Date:** 2026-05-06  

---

## SECTION 1: TRUE DUPLICATES (Zero Found)

**Result:** No actual duplicate chain entries detected.

The current architecture explicitly prevents duplicates:
- One `normalized_chain_id` per unique chain specification
- Manufacturer variants stored as separate source_refs, not separate chains
- Heavy/special series assigned distinct IDs (ANSI-40 vs ANSI-40H are different chains)

---

## SECTION 2: QUASI-DUPLICATES (Related Entries with Different Treatment)

### Category A: Heavy Series — Intentionally Separate IDs

**Decision:** APPROVED — Keep as separate normalized_chain_ids (engineering variants, not cosmetic).

| Base | Heavy Variant | Extra Heavy | Super Series | Premium (Lambda) | Status |
|------|---------------|-------------|--------------|------------------|--------|
| ANSI-40 | ANSI-40H | — | ANSI-40SS | — | **KEEP SEPARATE** |
| ANSI-50 | ANSI-50H | — | — | — | **KEEP SEPARATE** |
| ANSI-60 | ANSI-60H | — | — | — | **KEEP SEPARATE** |
| ANSI-80 | ANSI-80H | — | — | ANSI-80 Lambda | **KEEP SEPARATE** |
| ANSI-100 | ANSI-100H | — | — | — | **KEEP SEPARATE** |
| ANSI-120 | ANSI-120H | — | — | — | **KEEP SEPARATE** |
| ANSI-160 | ANSI-160H | — | — | — | **KEEP SEPARATE** |
| C2060 | C2060H | — | — | — | **KEEP SEPARATE** |
| C2080 | C2080H | — | — | — | **KEEP SEPARATE** |

**Rationale:** Each variant has distinct sidebar thickness, higher tensile strength, different load rating. Not cosmetic — engineering changes.

### Category B: Stainless Steel Variants — Intentionally Separate

**Decision:** APPROVED — Keep as separate normalized_chain_ids (material composition changes performance).

| Base (Carbon Steel) | Stainless 304 Variant | Stainless 316 Variant | Status |
|-------------------|----------------------|----------------------|--------|
| ANSI-25 | SS304-25A | — | **KEEP SEPARATE** |
| ANSI-40 | SS304-40A | — | **KEEP SEPARATE** |
| ANSI-60 | SS304-60A | — | **KEEP SEPARATE** |
| ANSI-80 | SS304-80A | — | **KEEP SEPARATE** |
| BS-08B | SS304-08B | — | **KEEP SEPARATE** |
| BS-12B | SS304-12B | — | **KEEP SEPARATE** |

**Rationale:** 304SS exhibits 3-8% tensile loss vs carbon. Corrosion resistance profile differs. Material derating must be explicit in normalized_chain_id, not buried in materials_available array.

### Category C: Manufacturer Premium Variants — Intentionally Separate

**Decision:** APPROVED — Preserve as distinct chain_ids with source-specific enhancements.

| Standard ANSI | Donghua SP (Shot-Peened) | Donghua X3 (Surface-Hardened) | Allied-Locke Super Series |
|---------------|--------------------------|-------------------------------|---------------------------|
| ANSI-40 | DH-SP-40 | DH-X3-40 | ANSI-40SS (merged into AL source_refs) |
| ANSI-60 | DH-SP-60 | — | — |
| ANSI-80 | DH-SP-80 | DH-X3-80 | — |

**Rationale:** Donghua SP/X3 series represent 25-52% strength improvement via proprietary processes (shot-peening, surface hardening). These are **not just material upgrades** — they are engineered variants. User selecting "ANSI-80" expects standard specs; selecting "DH-X3-80" expects premium performance.

**Manufacturer-specific enhancements preserved:** Lambda, Neptune, Titan, Hardened variants all maintained as distinct entries per your directive.

---

## SECTION 3: VARIANT NESTING — Relationship Mapping

### ANSI-80 Variant Family (Example Structure)

```
ANSI-80 (Base Standard)
├── ANSI-80H (Heavy series — thicker sidebars, higher tensile)
├── ANSI-80SS (Allied-Locke Super Series — shot-peened, optimized plates)
├── ANSI-80 Lambda (Tsubaki — oil-impregnated bushings)
├── SS304-80A (Stainless 304 variant of standard ANSI-80)
├── DH-SP-80 (Donghua SP Series — shot-peened version)
└── DH-X3-80 (Donghua X3 Series — surface-hardened version)
```

**Cross-references:** Each variant should store a `base_chain_id` pointer (e.g., SS304-80A.base_chain_id = "ANSI-80") to enable UI grouping or "see related variants" queries.

---

## SECTION 4: CONSOLIDATION CANDIDATES ANALYSIS

### Could These Be Consolidated? (Assessment)

#### Candidate 1: ANSI-40 vs ANSI-40H

**Current:** Separate normalized_chain_ids  
**Consolidation Option:** Single chain_id with `variant_type: "heavy"` property

**ASSESSMENT:** **DO NOT CONSOLIDATE**
- Sidebars are thicker (different geometry)
- Tensile strength is higher (structural change)
- Weight is higher
- Load ratings differ
- Sprocket compatibility may differ
- User queries for "ANSI-40" expect standard, not heavy series

**Decision:** Keep separate IDs per your directive.

#### Candidate 2: SS304-40A vs ANSI-40

**Current:** Separate normalized_chain_ids  
**Consolidation Option:** Single chain_id with `material_variant` property

**ASSESSMENT:** **DO NOT CONSOLIDATE**
- 5% tensile loss (performance impact)
- Different corrosion profile (application impact)
- Different temperature limits
- Different chemical compatibility
- RFQ systems must distinguish (cost difference ~30-40% premium for stainless)

**Decision:** Keep separate IDs per your directive.

#### Candidate 3: DH-SP-40 vs ANSI-40

**Current:** Separate normalized_chain_ids  
**Consolidation Option:** Single chain_id with `performance_enhancement: "SP"` property

**ASSESSMENT:** **DO NOT CONSOLIDATE**
- 30% tensile strength increase (major performance tier)
- Different manufacturing process (proprietary shot-peening)
- Different fatigue rating
- Donghua-specific offering (not directly from Tsubaki/ANSI standard)
- Cost premium for premium performance

**Decision:** Keep separate IDs per your directive.

---

## SECTION 5: EQUIVALENCY GROUPING (Not Consolidation)

Instead of consolidation, use **equivalency grouping** for UX:

```json
// In Normalized_Chains record for ANSI-40:
{
  "normalized_chain_id": "ANSI-40",
  "equivalent_variants": [
    "ANSI-40H",      // Heavy series (same pitch/roller, different sidebar)
    "SS304-40A",     // Stainless variant
    "DH-SP-40",      // Donghua premium
    "DH-X3-40"       // Donghua ultra-premium
  ],
  "base_chain_id": null,  // This IS the base
  "variant_type": "standard"
}

// In Normalized_Chains record for ANSI-40H:
{
  "normalized_chain_id": "ANSI-40H",
  "equivalent_variants": [
    "ANSI-40",       // Base standard (different load rating)
    "ANSI-40SS",     // Allied-Locke variant
    "SS304-40AH"     // Hypothetical stainless heavy
  ],
  "base_chain_id": "ANSI-40",
  "variant_type": "heavy_series"
}
```

This allows:
- Browse by family: "Show me all ANSI-40 variants"
- Filter by type: "Show me only heavy series"
- Compare specs: "ANSI-40 vs ANSI-40H vs DH-SP-40"
- Equivalency queries: "Find chains in ANSI-40 family compatible with my design"

---

## SECTION 6: DEDUPLICATION RULES (For Future Data Entry)

To prevent duplicates during Stage 1+ migration:

### Rule 1: Pitch + Roller Dia + Sidebar = Equivalency Check
If new chain entry matches pitch and roller diameter of existing chain, **check sidebar specs**:
- If sidebar is thicker → separate heavy series ID
- If sidebar is identical → possible duplicate

### Rule 2: Material = Family Separator
If material differs (carbon vs stainless vs ceramic), **create separate normalized_id**:
- Base: ANSI-40 (carbon steel)
- Variant: SS304-40A (304 stainless)
- Variant: SS316-40A (316 stainless)

### Rule 3: Performance Enhancement = Distinct Entry
If manufacturer claims structural improvement (not just coating):
- Shot-peening (DH-SP-40)
- Surface hardening (DH-X3-40)
- Induction hardening (WHX series)

Then **create separate normalized_id** with source attribution.

### Rule 4: Tensile Strength > ±8% = Distinct Entry
If same chain number has tensile specs differing > 8%:
- Check if source is higher authority (Tsubaki > Allied-Locke > Donghua)
- If authority is equal, treat as variant → separate ID
- If lower authority is higher spec, flag as "needs_review"

### Rule 5: Cross-Manufacturer Equivalency
ANSI-40 (Tsubaki) ≈ 40-1 (Tsubaki) ≈ 40A-1 (Donghua) ≈ 40 (Allied-Locke):
- All map to single `normalized_chain_id: "ANSI-40"`
- Stored as separate source_refs, not separate chains

---

## DUPLICATE MATRIX SUMMARY

| Category | Count | Duplicates Found | Action |
|----------|-------|------------------|--------|
| True Duplicates | 0 | **None** | N/A |
| Heavy Series Quasi-Duplicates | 9 | Intentional variants | **Keep Separate** |
| Stainless Quasi-Duplicates | 6 | Intentional variants | **Keep Separate** |
| Premium Performance Variants | 5 | Intentional variants | **Keep Separate** |
| Consolidation Candidates | 3 | All rejected | **Keep Separate** |
| **TOTAL SEPARATE IDS NEEDED** | **23+** | — | — |

---

**Conclusion:** Zero data consolidation needed. All "duplicates" are legitimate engineering variants that must remain distinct per your approval.

Equivalency grouping via `equivalent_variants[]` and `base_chain_id` will provide UX grouping without data loss.