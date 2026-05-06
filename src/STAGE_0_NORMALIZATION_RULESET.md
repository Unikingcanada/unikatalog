# Stage 0 Normalization Ruleset
## Unit, UOM, and Data Standardization Rules

**Status:** Rules Finalized | Ready for Stage 1 Implementation  
**Date:** 2026-05-06

---

## SECTION 1: UNIT NORMALIZATION FRAMEWORK

### Rule Set A: Dimensional Normalization

All dimensions must be stored with **source preservation + dual normalization**:

```json
"pitch": {
  "source_value": 0.500,              // Original as received (no strings)
  "source_uom": "in",                 // Original unit [in | mm]
  "source_manufacturer": "Tsubaki",   // Attribution
  "pitch_mm": 12.70,                  // ISO metric conversion (exact)
  "pitch_in": 0.5000,                 // Imperial canonical (to 4 decimals)
  "conversion_method": "iso_standard", // [iso_standard | approximation]
  "tolerance_mm": 0.05                // Family-specific tolerance
}
```

**Conversion Rules:**
- 1 inch = 25.4 mm (exact)
- All metric values to 2 decimal places (mm)
- All imperial values to 4 decimal places (inches)
- Exception: If source already precise (e.g., "6.35 mm" for 1/4"), preserve precision, convert to other unit

### Rule Set B: Performance Data Normalization

All tensile/working load fields:

```json
"tensile_strength": {
  "source_value": 3700,                    // Original number (no units in value)
  "source_uom": "lbs",                     // [lbs | lbf | kn | kgf]
  "source_manufacturer": "Tsubaki",        // Attribute to source
  "source_standard": "ANSI B29.1",         // Standard/reference document
  "tensile_kn": 16.46,                     // Metric (to 2 decimals)
  "tensile_lbf": 3700,                     // Imperial (force unit)
  "conversion_factor": 4.448,              // Exact conversion 1 kN = 224.809 lbf
  "conversion_method": "exact",            // [exact | iso_standard | approximation]
  "performance_tier": "standard",          // [standard | performance | premium]
  "confidence": "high"                     // [confirmed | high | medium | low]
}
```

**Conversion Constants:**
- 1 kN = 224.809 lbf (exact)
- 1 kgf = 9.80665 N
- Round final values to 2 decimal places

### Rule Set C: Weight Normalization

```json
"weight": {
  "source_value": 0.85,
  "source_uom": "kg/m",                    // [kg/m | lbs/ft | kg/link]
  "weight_kg_m": 0.85,                     // Metric standard
  "weight_lbs_ft": 0.57,                   // Imperial equivalent (1 kg/m = 0.6720 lbs/ft)
  "conversion_method": "iso_standard"
}
```

---

## SECTION 2: DYNAMIC DIMENSIONAL TOLERANCE RANGES

**Decision:** Do NOT use global tolerance. Use family-specific ranges for equivalency matching.

### Tolerance by Chain Family

| Family | Tolerance Range | Application | Example Chains |
|--------|-----------------|-------------|-----------------|
| **ANSI Precision Roller** | ±0.05–0.15 mm | High-precision interchangeability | ANSI-25 through ANSI-240 |
| **Conveyor Roller** | ±0.25 mm | Moderate tolerance | C2040, C2060H, C2080H |
| **Engineering Class** | ±0.5 mm | Lower precision | SS78, MSR6018, MXS881 |
| **Welded Steel** | ±0.75 mm | Heavy industrial tolerance | WH78, WH124, WH150 |
| **Agricultural** | ±0.5 mm | Field-use tolerance | CA550, CA620, S55 |
| **Specialty/Custom** | ±1.0 mm | Variable per application | Sugar mill, palm oil, lumber |

**Usage:** When checking if two chains are equivalent:
```
IF pitch_delta < family_tolerance THEN "acceptable equivalency"
ELSE "separate chain entries"
```

**Examples:**
- ANSI-40 vs ANSI-40H: Pitch identical (0.500"), different sidebar → separate entries (not tolerance issue)
- WH78 (4.000" pitch) vs WH78-4 (listed as "WH78 at 4" pitch"): Within welded tolerance ±0.75mm? 
  - 4.000" = 101.60 mm; ASME baseline 4.063" = 103.19 mm; delta = 1.59 mm > 0.75 mm
  - **Decision needed:** Clarify if this is genuine variant or data error

---

## SECTION 3: SOURCE UNIT PRESERVATION

**Rule:** Store original units as received; never transform source_uom.

### Detected Source UOM Patterns

| Manufacturer | Typical UOM Pattern | Example |
|--------------|-------------------|---------|
| **Tsubaki** | inches + mm pairs | pitch_in: "0.500" / pitch_mm: "12.70" |
| **Allied-Locke** | inches (decimal) | pitch_in: 0.500 (numeric, not string) |
| **Donghua** | mm primary, in secondary | pitch_mm: 6.35, pitch_in: 0.250 |
| **ANSI Standards** | inches (fractional written as decimal) | 1/2" stored as 0.500 |
| **ISO Standards** | mm primary | pitch_mm: 12.70 |
| **Welded/Mill Chains** | inches only | pitch_in: 2.609 |

**Normalization Rule:** Accept mixed units but normalize storage:
- Store source as-received in source_value + source_uom
- Convert to both metric (mm, kN) and imperial (in, lbf)
- Preserve conversion_method flag

---

## SECTION 4: CONFIDENCE & ATTRIBUTION RULES

### Authority-Based Confidence Levels

| Tier | Manufacturer | Confidence | Rule | Example |
|------|--------------|-----------|------|---------|
| **1** | Tsubaki | **Confirmed** | Accept as baseline; Tier 2+ specs override only if justified | ANSI-40: 3,700 lbs (Tsubaki) |
| **2** | Rexnord / Allied-Locke / Renold | **High** | Accept; flag if differs >5% from Tier 1 | ANSI-40: 3,970 lbs (AL, +7.3%) |
| **3** | Donghua / IWIS / Webster | **Medium** | Accept; requires high-confidence justification if conflicts | ANSI-40 SP: 4,800 lbs (DH, +30%) |
| **4** | Generic / Scraped | **Low** | Requires Tier 1-3 validation | "ANSI 40 ~3,700 lbs" (unattributed) |

### Confidence Assignment Rules

```
IF source = Tsubaki lab-tested data
  THEN confidence = "confirmed"
ELSE IF source = official manufacturer catalog
  THEN confidence = "high"
ELSE IF source = multiple sources agree (>2 agree, variation <5%)
  THEN confidence = "high"
ELSE IF source = single non-Tier-1 manufacturer
  THEN confidence = "medium"
ELSE IF source = generic ANSI standard
  THEN confidence = "medium"
ELSE IF source = estimated / single unvalidated source
  THEN confidence = "low"
ELSE IF source = conflict between Tier 1 and Tier 2
  THEN confidence = "medium" + flag "needs_review"
ELSE IF source = conflict between Tier 1 and Tier 3
  THEN confidence = "low" + flag "needs_review"
```

---

## SECTION 5: CONFLICT RESOLUTION ALGORITHM

When multiple sources have conflicting specs for same `normalized_chain_id`:

### Step 1: Authority Filtering
```
sources = [all_sources_for_chain]
tier_1_sources = sources.filter(s => s.tier == 1)

IF tier_1_sources.length > 0:
  // Use Tier 1 as baseline
  baseline = tier_1_sources[0]
  baseline.confidence = "confirmed"
ELSE:
  // Use highest available tier
  baseline = sources.sort_by_tier()[0]
  baseline.confidence = "high"
```

### Step 2: Delta Check vs Baseline
```
FOR EACH other_source IN sources:
  delta_percent = abs(other_source.value - baseline.value) / baseline.value * 100
  
  IF delta_percent < 3%:
    // Negligible, accept as confirmation
    other_source.confidence = "high"
    other_source.status = "confirmed_secondary"
  
  ELSE IF delta_percent < 8%:
    // Within acceptable variation (manufacturing tolerance + testing variation)
    other_source.confidence = "medium"
    other_source.status = "alternative_acceptable"
    other_source.note = "Within tolerance; alternative source acceptable"
  
  ELSE:
    // Significant conflict
    other_source.confidence = "low"
    other_source.status = "conflict_detected"
    other_source.flag = "needs_review"
```

### Step 3: Decision Matrix

| Baseline Tier | Other Tier | Delta % | Action | Confidence |
|---------------|-----------|---------|--------|-----------|
| 1 | 2 | <3% | Accept secondary | HIGH |
| 1 | 2 | 3-8% | Flag as variation | MEDIUM |
| 1 | 2 | >8% | Escalate for review | LOW |
| 1 | 3 | <5% | Create separate performance_tier | MEDIUM |
| 1 | 3 | >5% | Create distinct normalized_id | LOW |
| 2 | 3 | <5% | Accept secondary | MEDIUM |
| 2 | 3 | >5% | Escalate to Tier 1 for clarification | LOW |

---

## SECTION 6: MATERIAL DERATING RULES

For material variants (stainless, coatings, special treatments):

```json
"material_variant": {
  "base_material": "carbon_steel",
  "variant_material": "stainless_304",
  "derating_percent": -5.0,              // Percentage loss vs base
  "derating_source": "Donghua",
  "derating_confidence": "medium",       // Based on limited data
  "specification": {
    "base_tensile": 3700,                // Carbon steel spec
    "variant_tensile": 3500,             // Stainless spec (3700 - 5%)
    "conversion_method": "manufacturer_tested"
  },
  "notes": "Stainless 304 exhibits ~5% tensile loss due to material properties. Specification varies by heat treat."
}
```

**Rules:**
- Preserve both base and variant specs
- Document derating percentage and source
- Create separate normalized_chain_id for each material variant
- Do NOT attempt to estimate derating if not documented by manufacturer

---

## SECTION 7: FIELD MAPPING RULES

### chainNormalizedDictionary.js → Normalized_Chains

| Source Field | Target Field | Normalization Rule |
|--------------|--------------|-------------------|
| `chain_id` | `normalized_chain_id` | Direct copy (primary key) |
| `pitch_in` (string) | `pitch.source_value` | Convert string to number |
| `pitch_in` | `pitch.pitch_in` | Preserve original |
| `pitch_mm` (string) | `pitch.pitch_mm` | Convert string to number |
| `avg_ultimate_lbs` | `tensile_strength.source_value` | Direct copy |
| `max_working_load_lbs` | `working_load.source_value` | Direct copy |
| `specs` (nested object) | Decompose into individual dimension fields | Extract roller_dia, pin_dia, etc. |
| `source_refs[]` | `source_data[]` | Merge with authority tier assignment |
| `materials_available[]` | `materials_available` | Direct copy; apply derating if stainless |

---

## SECTION 8: VALIDATION & CHECKS

### Pre-Migration Validation

Before creating Normalized_Chains entities:

1. **Unit Check:** All source_value must be numeric (no strings)
2. **Attribution Check:** Every numeric field must have source_manufacturer
3. **Conversion Check:** Verify imperial → metric conversions within rounding error
4. **Completeness Check:** Flag chains missing pitch or tensile_strength as incomplete
5. **Confidence Check:** Assign confidence level per Authority rules; flag "low" for review
6. **Authority Check:** Verify Tier 1 sources used as baseline where available
7. **Tolerance Check:** Verify delta between alternatives vs dynamic tolerance
8. **Variant Check:** Confirm heavy/stainless/premium variants assigned distinct normalized_ids

### Post-Migration Validation

After loading entities:

1. **Equivalency Audit:** Verify source_refs all map to distinct manufacturers
2. **Confidence Audit:** Report all "low" confidence entries
3. **Conflict Audit:** Report all "needs_review" flags
4. **Coverage Audit:** Count % complete for each family (dimensions, speed, images)

---

## NORMALIZATION RULESET SUMMARY

| Rule Category | Count | Status |
|---------------|-------|--------|
| Unit Normalization | 3 rule sets | **Final** |
| Tolerance Ranges | 6 family types | **Final** |
| Authority Tiers | 4 tiers | **Final** |
| Conflict Resolution | 15 decision matrix cells | **Final** |
| Material Derating | 1 pattern | **Final** |
| Field Mapping | 8 source fields → targets | **Final** |
| Validation Checks | 13 pre+post checks | **Final** |

**Total Rules:** 50+  
**Status:** Ready for Stage 1 implementation