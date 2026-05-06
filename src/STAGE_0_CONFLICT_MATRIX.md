# Stage 0 Conflict Matrix
## Dimensional & Performance Conflicts Across Sources

**Status:** Analysis Only | No Resolution Applied  
**Date:** 2026-05-06  

---

## SECTION 1: ANSI STANDARD CHAINS — Tensile Strength Conflicts

### Tier 1 vs Tier 2 Conflicts (Tsubaki vs Allied-Locke/Rexnord)

| Chain ID | Parameter | Tsubaki | Allied-Locke | Rexnord | Conflict Type | Delta | Severity | Resolution Rule |
|----------|-----------|---------|--------------|---------|---------------|-------|----------|-----------------|
| ANSI-35 | Tensile (lbs) | 2,100 | 2,320 | — | Tensile mismatch | +10.5% | HIGH | Accept AL as performance tier |
| ANSI-40 | Tensile (lbs) | 3,700 | 3,970 | 3,700 | AL exceeds standard | +7.3% | HIGH | AL = shot-peened variant |
| ANSI-50 | Tensile (lbs) | 6,100 | 6,620 | — | AL exceeds standard | +8.5% | HIGH | AL = performance tier |
| ANSI-60 | Tensile (lbs) | 8,500 | 9,270 | — | AL exceeds standard | +9.1% | HIGH | AL = performance tier |
| ANSI-80 | Tensile (lbs) | 14,500 | 16,540 | — | AL exceeds standard | +14.1% | **CRITICAL** | Flag AL specs as "High-Strength" variant |
| ANSI-100 | Tensile (lbs) | 24,000 | 25,360 | — | AL exceeds standard | +5.7% | HIGH | AL = performance tier |
| ANSI-120 | Tensile (lbs) | 34,000 | 32,640 | — | AL below ANSI standard | -4.0% | MEDIUM | AL more conservative; use for safety margin |
| ANSI-160 | Tensile (lbs) | 58,000 | 57,780 | — | Negligible | -0.4% | LOW | Accept either source |

**Pattern:** Allied-Locke specs 5-14% above ANSI nominal (shot-peened, induction-hardened). Except ANSI-120 (more conservative). **Decision:** Preserve AL specs as separate performance tier; do NOT override Tsubaki baseline.

---

### Tier 3 Conflicts (Donghua vs Tsubaki)

| Chain ID | Parameter | Tsubaki Baseline | Donghua SP Series | Donghua X3 Series | Conflict Type | Delta (SP) | Delta (X3) | Severity |
|----------|-----------|------------------|-------------------|-------------------|---------------|-----------|-----------|----------|
| ANSI-40 | Tensile (lbs) | 3,700 | 4,800 (SP) | 5,200 (X3) | Higher strength | +30% | +40% | **CRITICAL** |
| ANSI-60 | Tensile (lbs) | 8,500 | 11,000 (SP) | — | Higher strength | +29% | — | **CRITICAL** |
| ANSI-80 | Tensile (lbs) | 14,500 | 20,000 (SP) | 22,000 (X3) | Higher strength | +38% | +52% | **CRITICAL** |

**Pattern:** Donghua SP (shot-peened) and X3 (surface-hardened) series **intentionally** exceed ANSI specs. **Decision:** These are manufacturer-specific premium lines; preserve as distinct normalized_chain_id entries (e.g., `DH-SP-40`, `DH-X3-80`).

---

## SECTION 2: WELDED STEEL CHAINS — Working Load Conflicts

### Allied-Locke Conservative Spec

| Chain ID | Parameter | Baseline | Allied-Locke | Delta | Notes |
|----------|-----------|----------|--------------|-------|-------|
| WH78 | Working Load (lbs) | 3,600 | 3,500 | -2.8% | AL more conservative |
| WH124 | Working Load (lbs) | 7,600 | 7,200 | -5.3% | AL more conservative |

**Pattern:** AL uses tighter safety factor for welded chains. **Decision:** Use AL as primary source (conservative = safer); baseline as reference only.

---

## SECTION 3: MATERIAL VARIANT CONFLICTS — Stainless vs Carbon Steel

### Tensile Strength Derating (304 Stainless)

| Base Chain | Carbon Steel | 304 Stainless | Derating % | Source | Confidence |
|------------|-------------|----------------|-----------|--------|-----------|
| ANSI-25 | 925 lbs | 850 lbs | -8% | Donghua | Medium |
| ANSI-40 | 3,700 lbs | 3,500 lbs | -5% | Donghua | Medium |
| ANSI-60 | 8,500 lbs | 8,000 lbs | -6% | Donghua | Medium |
| ANSI-80 | 14,500 lbs | 14,000 lbs | -3% | Donghua | Medium |
| BS-16B | 13,500 lbs | — | — | Missing | **CRITICAL** |

**Pattern:** Donghua documents 3-8% tensile loss on 304SS due to material properties. **Decision:** Store stainless as separate normalized_chain_id with documented derating; preserve both carbon and stainless specs.

---

## SECTION 4: DIMENSION CONFLICTS — Roller Diameter

### ANSI 40 Across Sources

| Source | Pitch (in) | Roller Dia (in) | Roller Width (in) | Inner Width (in) | Notes |
|--------|-----------|-----------------|-------------------|------------------|-------|
| ANSI B29.1 | 0.500 | 0.312 | 0.312 | — | Standard |
| Allied-Locke | 0.500 | 0.312 | 0.312 | — | Confirmed |
| Donghua | 0.500 | 0.312 | 0.312 | — | Confirmed |
| Tsubaki | 0.500 | 0.312 | 0.312 | — | Standard |

**Verdict:** No conflict. Standardization: 0.312" = 7.9375mm ≈ 7.94mm (ISO precision +0.0mm/-0.01mm).

### Double Pitch Conveyor Chains — C2060H

| Source | Pitch (in) | Pitch (mm) | Roller Dia (in) | Conflict | Notes |
|--------|-----------|-----------|-----------------|----------|-------|
| ANSI B29.4 | 1.500 | 38.10 | 0.469 | None | Standard |
| Allied-Locke | 1.500 | 38.10 | 0.469 | None | Confirmed |
| Donghua | 1.500 | 38.10 | 0.469 | None | Confirmed |
| Tsubaki | 1.500 | 38.10 | 0.469 | None | Standard |

**Verdict:** No conflict. All sources agree on ISO equivalent.

### Welded Steel Chains — WH124

| Source | Pitch (in) | Pitch (mm) | Barrel Dia (in) | Max Sprocket Face | Notes |
|--------|-----------|-----------|-----------------|-------------------|-------|
| Allied-Locke | 4.000 | 101.60 | 1.25 | 1.50 | Confirmed |
| ASME B29.100 | 4.063 | 103.19 | — | — | Baseline |

**Conflict:** Pitch discrepancy 4.000" vs 4.063". **Investigation:** Allied-Locke WH124 uses 4.000" pitch (simplified); ASME standard lists 4.063". **Decision:** Flag as tolerance issue; dynamic tolerance for welded chains = ±0.75mm allows both (101.60 ≈ 103.19 ±0.75mm? NO — 1.59mm delta exceeds tolerance).

**ESCALATION:** Needs clarification — is this a genuine variant or data entry error?

---

## SECTION 5: SPEED DATA CONFLICTS

### Missing Speed Specifications

| Chain Family | ANSI Chains | Conveyor | Engineering | Welded | Specialty |
|--------------|-------------|----------|-------------|--------|-----------|
| Max Speed Documented | 40% | 20% | 15% | 0% | 5% |
| Data Source | Tsubaki (partial) | — | — | — | — |
| **Recommendation** | Source from catalogs | Source from catalogs | Source from catalogs | Source from catalogs | Flag for later |

**Conflict:** Speed data almost completely absent. **Decision:** Mark as "needs_review" for all chains; obtain from manufacturer catalogs in Stage 2+.

---

## SECTION 6: IMAGE/DRAWING CONFLICTS

### Missing Live Product Images

| Family | Live Photo Coverage | Engineering Drawing | Conflict |
|--------|---------------------|-------------------|----------|
| ANSI Roller | 40% (AL only) | 20% | Only AL has images |
| Double Pitch | 0% | 0% | **CRITICAL** |
| Welded Steel | 15% (AL only) | 10% | Sparse |
| Engineering Class | 5% | 5% | **CRITICAL** |
| Specialty | 10% | 5% | **CRITICAL** |

**Conflict:** Severe image gap. **Decision:** Flag for sourcing in Stage 2+; use generic family images as fallback.

---

## CONFLICT SUMMARY TABLE

| Conflict Category | Count | Severity | Tier Involved | Resolution |
|------------------|-------|----------|---------------|-----------|
| Tensile Strength (Tier 1 vs 2) | 6 | HIGH | Tsubaki vs AL/Rexnord | Accept AL as performance tier |
| Tensile Strength (Tier 1 vs 3) | 3 | **CRITICAL** | Tsubaki vs Donghua SP/X3 | Preserve as distinct chain_ids |
| Working Load (Tier 2) | 2 | MEDIUM | AL conservative safety margin | Use AL as primary |
| Material Derating | 4 | HIGH | Carbon vs 304SS | Separate normalized_ids |
| Pitch (Welded) | 1 | **CRITICAL** | WH124 4.000" vs 4.063" | Needs clarification |
| Speed | 0 | MEDIUM | All tiers | Mark for Stage 2 sourcing |
| Images | Multiple | HIGH | All families | Flag for Stage 2 sourcing |

---

**Total Conflicts Requiring Resolution:** 16 high-severity, 1 critical clarification needed, 7 medium-severity data gaps.

**Escalations to User:** 
- WH124 pitch discrepancy (4.000" vs 4.063")
- Speed data sourcing strategy
- Image sourcing budget/timeline