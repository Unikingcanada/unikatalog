# Stage 0 Authority Resolution Rules
## Tier-Based Decision Framework for Multi-Source Data

**Status:** Rules Finalized | Ready for Stage 1  
**Date:** 2026-05-06

---

## AUTHORITY HIERARCHY (Final)

### Tier 1: Highest Authority
**Tsubaki**
- Original ANSI standard developer (lab-tested reference specs)
- OEM-specified by major equipment manufacturers
- Baseline for all ANSI comparisons
- Confidence = "Confirmed"

### Tier 2: High Authority
**Rexnord, Allied-Locke, Renold**
- Official manufacturer catalogs
- Performance certifications (shot-peened, hardened variants)
- ISO 606 validated (Renold)
- Wide market distribution
- Confidence = "High"

### Tier 3: Medium Authority
**Donghua, IWIS, Webster**
- Official catalogs with detailed specs
- ISO 606 compliant
- Emerging manufacturer innovations (SP, X3 series)
- Regional variations in standards
- Confidence = "Medium"

### Tier 4: Low Authority
**Generic/Scraped/Unattributed**
- Internet forums, wikis, unvalidated sources
- Aggregated data without source attribution
- Simplified specs (rounding, estimation)
- Confidence = "Low"

---

## RESOLUTION RULE SET

### Rule 1: When Tier 1 Exists, Use as Baseline

**Application:** ANSI standard chains (25–240)

```
IF Tsubaki specification available for normalized_chain_id:
  PRIMARY_SPEC = Tsubaki
  PRIMARY_CONFIDENCE = "Confirmed"
  PRIMARY_TIER = 1
  
  // All other sources become secondary references
  FOR EACH other_source IN [Rexnord, AL, Renold, Donghua, ...]:
    other_source.status = "secondary_reference"
    other_source.confidence = assess_delta(other_source.value, Tsubaki.value)
```

**Example:** ANSI-40
- Tsubaki: 3,700 lbs tensile → PRIMARY
- Allied-Locke: 3,970 lbs tensile → Secondary (flag: +7.3% variation)
- Donghua: 3,700 lbs tensile → Secondary (confirms primary)

**Outcome:** Store all specs; mark AL as "performance_tier: performance" (intentional enhancement).

---

### Rule 2: When No Tier 1, Promote Tier 2

**Application:** Welded steel, engineering class, specialty chains (sparse Tsubaki data)

```
IF Tsubaki specification NOT available:
  CANDIDATES = [Rexnord, Allied-Locke, Renold] ∩ available_sources
  
  IF CANDIDATES.length > 0:
    PRIMARY_SPEC = CANDIDATES[0]  // First Tier 2 source
    PRIMARY_CONFIDENCE = "High"
    PRIMARY_TIER = 2
  ELSE IF Donghua available:
    PRIMARY_SPEC = Donghua
    PRIMARY_CONFIDENCE = "Medium"
    PRIMARY_TIER = 3
```

**Example:** WH124 Welded Steel
- Tsubaki: NOT available
- Allied-Locke: 7,200 lbs working load (pitch 4.000") → PRIMARY (Tier 2)
- ASME B29.100: 7,600 lbs working load (pitch 4.063") → Secondary reference
- Note: Pitch discrepancy → flag "needs_clarification"

**Outcome:** Use AL spec as primary; flag pitch conflict for Stage 2 clarification.

---

### Rule 3: Tier 2–3 Conflicts — Authority Wins

**Application:** When Tier 2 and Tier 3 sources disagree

```
IF TIER_2_source AND TIER_3_source have conflicting specs:
  
  delta = abs(Tier2.value - Tier3.value) / Tier2.value * 100
  
  IF delta < 5%:
    // Acceptable variation (material/testing tolerance)
    PRIMARY = TIER_2
    SECONDARY = TIER_3 (status: "acceptable_variation")
    CONFIDENCE = "High"
  ELSE:
    // Significant conflict
    PRIMARY = TIER_2
    SECONDARY = TIER_3 (status: "conflict_detected", flag: "needs_review")
    CONFIDENCE = "Medium"
```

**Example:** Stainless Chains
- Tier 2: Allied-Locke SS304-40A tensile NOT documented
- Tier 3: Donghua SS304-40A tensile = 3,500 lbs (vs 3,700 carbon)
- Decision: Accept Donghua as primary for stainless (only source); confidence = "medium"

---

### Rule 4: Premium Variants — Preserve Manufacturer Enhancements

**Decision:** Manufacturer-specific premium improvements must remain as distinct entries, NOT merged into base chain.

**Application:** Donghua SP/X3 series, Allied-Locke Super Series, Tsubaki Lambda, etc.

```
IF manufacturer_premium_spec.tensile > tier1_baseline.tensile AND
   manufacturer_premium_spec.is_documented_enhancement = TRUE:
  
  CREATE DISTINCT normalized_chain_id
  EXAMPLE: "DH-SP-40" NOT merged into "ANSI-40"
  
  REASON: 30% strength improvement is engineering change, not material variant
  SOURCE_AUTHORITY = manufacturer_tier (Donghua = Tier 3)
  CONFIDENCE = manufacturer's_confidence (usually "high" for premium line)
```

**Premium Variants to Preserve:**

| Base | Variant ID | Manufacturer | Enhancement Type | Tensile Delta | Status |
|------|-----------|--------------|------------------|---------------|--------|
| ANSI-40 | DH-SP-40 | Donghua | Shot-peened | +30% | **SEPARATE** |
| ANSI-80 | DH-X3-80 | Donghua | Surface-hardened | +52% | **SEPARATE** |
| ANSI-80 | ANSI-80 Lambda | Tsubaki | Oil-impregnated bushings | +20% | **SEPARATE** |
| ANSI-80 | ANSI-80SS | Allied-Locke | Super Series (shot-peened) | +14% | **SEPARATE** |

**Rule:** If > 8% tensile improvement documented by manufacturer, create separate ID with performance_tier = "premium" or "performance".

---

### Rule 5: Cross-Authority Premium Claims — Verification

**Application:** When lower-authority source claims higher performance than Tier 1

```
IF TIER_3_source.tensile > TIER_1_source.tensile BY > 5%:
  
  // Potential conflict
  ASSESSMENT:
    - Is TIER_3 claiming INTENTIONAL enhancement (SP, X3, premium)?
      YES → Create separate normalized_id (preserve variant)
      NO → Flag as "conflict_detected" → needs_review
    
    - Can TIER_3 enhancement be verified (catalog, lab test data)?
      YES → Accept; set confidence = "medium"
      NO → Flag as "unverified_claim" → needs_review
```

**Example 1:** Donghua SP Series (VERIFIED)
- TIER_1 (Tsubaki): ANSI-40 = 3,700 lbs
- TIER_3 (Donghua): DH-SP-40 = 4,800 lbs (documented shot-peening process)
- Assessment: Intentional enhancement, documented → Create DH-SP-40 as separate ID ✓

**Example 2:** Random Supplier Claim (UNVERIFIED)
- TIER_1 (Tsubaki): ANSI-40 = 3,700 lbs
- TIER_4 (Unknown): "Super-Strong 40" = 5,000 lbs (no process documentation)
- Assessment: Unverified claim, no documentation → Flag as "needs_review" ⚠

---

### Rule 6: Authority Tie-Breaker (Two Tier 2 Sources Conflict)

**Application:** When Tier 2 sources (Allied-Locke vs Rexnord) disagree

```
IF Tier2_Source_A.value ≠ Tier2_Source_B.value:
  
  delta = abs(A - B) / average(A, B) * 100
  
  IF delta < 3%:
    // Negligible; accept either; flag as "multiple sources agree"
    PRIMARY = Source_A (alphabetical order tiebreaker)
    SECONDARY = Source_B (status: "confirmed_alternative")
    CONFIDENCE = "High"
  
  ELSE IF delta < 8%:
    // Within tolerance; investigate reason
    REASON = check_manufacturing_differences(A, B)
    IF reason_found:
      PRIMARY = more_conservative_source (safety margin)
      SECONDARY = other (status: "alternative_acceptable")
      CONFIDENCE = "High"
    ELSE:
      CONFIDENCE = "Medium"
      FLAG = "investigate_source_difference"
  
  ELSE:
    // Significant conflict; needs resolution
    FLAG = "conflict_between_tier2_sources"
    ESCALATE = needs_review
    CONFIDENCE = "Low"
```

**Example:** WH78 Working Load
- Allied-Locke: 3,500 lbs (conservative design)
- Baseline: 3,600 lbs
- Delta: -2.8% (within 8% threshold)
- Reason: AL uses higher safety factor for welded chains
- Decision: Use AL as primary (conservative preferred) ✓

---

### Rule 7: Manufacturer-Specific Variants — Authority Preservation

**Application:** When Tier 3 manufacturer offers variant not in Tier 1

**Rule:** Preserve manufacturer authority + confidence level per tier, even if variant unavailable from Tier 1.

```
IF Tier3_manufacturer_offers_variant AND NOT in_Tier1_catalog:
  
  CREATE normalized_chain_id = "{MANUFACTURER}-{VARIANT_CODE}"
  
  EXAMPLES:
    - "DH-SP-40" (Donghua-specific premium)
    - "DH-X3-80" (Donghua-specific ultra-premium)
    - "SB-40" (side-bow variant)
    - "CA625" (agricultural specialty)
  
  AUTHORITY = Tier_of_manufacturer
  CONFIDENCE = manufacturer_documented_confidence
  RELATIONSHIP.base_chain_id = closest_ANSI_equivalent
  RELATIONSHIP.equivalent_variants = cross_compatible_chains
```

**Example:** Donghua Side-Bow Chains
- ANSI doesn't document side-bow variant
- Donghua offers SB-40, SB-60, SB-80
- Decision: Create "SB-40", "SB-60", "SB-80" as normalized_ids (Tier 3 authority)
- Relationship: SB-40.base_chain_id = "ANSI-40"
- Outcome: User can browse "ANSI-40 family" and discover SB-40 variant ✓

---

## CONFLICT ESCALATION MATRIX

| Scenario | Authority Delta | Delta % | Action | Escalation |
|----------|-----------------|---------|--------|-----------|
| Tier 1 vs Tier 2 | 1 step | <3% | Accept secondary | None |
| Tier 1 vs Tier 2 | 1 step | 3-8% | Flag variation | Low |
| Tier 1 vs Tier 2 | 1 step | >8% | Investigate | Medium |
| Tier 1 vs Tier 3 | 2 steps | <5% | Create variant ID | Low |
| Tier 1 vs Tier 3 | 2 steps | >5% | Flag conflict | Medium |
| Tier 2 vs Tier 2 | Same | <3% | Accept either | None |
| Tier 2 vs Tier 2 | Same | 3-8% | Use conservative | Low |
| Tier 2 vs Tier 2 | Same | >8% | Investigate | Medium |
| Tier 2 vs Tier 3 | 1 step | <5% | Use Tier 2 | Low |
| Tier 2 vs Tier 3 | 1 step | >5% | Flag conflict | Medium |
| Tier 1 vs Tier 4 | 3 steps | Any % | Verify with Tier 1 | High |

---

## IMPLEMENTATION CHECKLIST FOR STAGE 1

- [ ] Assign Tier (1–4) to every source_ref
- [ ] Identify Tier 1 sources for each normalized_chain_id
- [ ] Run conflict resolution algorithm on all conflicting specs
- [ ] Create separate IDs for all documented premium variants (SP, X3, Lambda, etc.)
- [ ] Flag all "needs_review" conflicts for Stage 2 clarification
- [ ] Document confidence level for every numeric field
- [ ] Verify delta calculations against tolerance ranges
- [ ] Cross-check equivalency grouping with authority hierarchy

---

**Authority Resolution Rules: READY FOR STAGE 1 IMPLEMENTATION**