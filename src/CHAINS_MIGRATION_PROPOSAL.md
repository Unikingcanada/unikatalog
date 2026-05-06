# Chains Ecosystem Migration Plan
## Static JS → Base44 Entities

**Date:** 2026-05-06  
**Scope:** Chains only (All other product ecosystems excluded)  
**Status:** PROPOSAL ONLY - No execution or file modifications

---

## 1. PROPOSED ENTITY SCHEMA

### 1.1 Normalized_Chains (Core)
```json
{
  "name": "Normalized_Chains",
  "properties": {
    "normalized_chain_id": { "type": "string", "description": "Unique canonical ID (e.g., ANSI-40, WH78, 667-PINTLE)" },
    "chain_family": { "type": "string", "enum": ["Performance Roller Chains", "Conveyor Roller Chains", "Attachment Roller Chains", "Hollow Pin Chains", "Double Pitch Conveyor Chains", "Engineered Class Chains", "Welded Steel Chains", "Steel Pintle Chains", "Steel Bushed Chains", "Agricultural Conveyor Chains", "SharpTop Chains", "Forged Chains", "Drop Forged Rivetless Chains", "Overhead Conveyor Chains", "Drag / Scraper Chains", "Bucket Elevator Chains", "Leaf Chains", "Specialty / Custom Chains"] },
    "chain_category": { "type": "string" },
    "chain_subcategory": { "type": "string" },
    "chain_number": { "type": "string", "description": "Standard designation (e.g., 40, 80H, C2060H, WH78, 667)" },
    "display_name": { "type": "string", "description": "Full normalized display name (e.g., ANSI 40 Roller Chain)" },
    "standard": { "type": "string", "description": "Applicable standard (e.g., ANSI B29.1, ISO 606, DIN 8188)" },
    "pitch_in": { "type": "string" },
    "pitch_mm": { "type": "string" },
    "roller_diameter_mm": { "type": "string" },
    "inside_width_mm": { "type": "string" },
    "pin_diameter_mm": { "type": "string" },
    "sidebar_height_mm": { "type": "string" },
    "sidebar_thickness_mm": { "type": "string" },
    "drawing_url": { "type": "string" },
    "image_url": { "type": "string" },
    "status": { "type": "string", "enum": ["Active", "Pending Review", "Discontinued", "On Request"] },
    "needs_review": { "type": "boolean" },
    "application_tags": { "type": "array", "items": { "type": "string" } },
    "notes": { "type": "string" }
  },
  "required": ["chain_family", "chain_number"]
}
```

### 1.2 Chain_Dimensions
```json
{
  "name": "Chain_Dimensions",
  "properties": {
    "dimension_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "source_manufacturer": { "type": "string", "description": "Brand that sourced this data (Allied Locke, Donghua, Uniking, etc.)" },
    "source_part_number": { "type": "string" },
    "pitch_mm": { "type": "number" },
    "roller_diameter_mm": { "type": "number" },
    "inside_width_mm": { "type": "number" },
    "pin_diameter_mm": { "type": "number" },
    "pin_length_mm": { "type": "number" },
    "sidebar_height_mm": { "type": "number" },
    "sidebar_thickness_mm": { "type": "number" },
    "transverse_pitch_mm": { "type": "number" },
    "weight_kg_m": { "type": "number" },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" },
    "confidence": { "type": "string", "enum": ["Confirmed", "Needs Review", "Estimated"] }
  },
  "required": ["normalized_chain_id", "source_manufacturer"]
}
```

### 1.3 Manufacturer_Equivalents
```json
{
  "name": "Manufacturer_Equivalents",
  "properties": {
    "equiv_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "manufacturer": { "type": "string" },
    "source_part_number": { "type": "string" },
    "source_series": { "type": "string" },
    "confidence": { "type": "string", "enum": ["Confirmed", "Needs Review", "Missing Data"] },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" },
    "notes": { "type": "string" }
  },
  "required": ["normalized_chain_id", "manufacturer"]
}
```

### 1.4 Performance_Data
```json
{
  "name": "Performance_Data",
  "properties": {
    "perf_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "manufacturer": { "type": "string" },
    "source_part_number": { "type": "string" },
    "tensile_strength_kn": { "type": "number" },
    "tensile_strength_lbf": { "type": "number" },
    "average_tensile_strength_kn": { "type": "number" },
    "max_working_load_lbf": { "type": "number" },
    "breaking_load_lbf": { "type": "number" },
    "performance_tier": { "type": "string", "description": "Standard Duty / Performance Duty / Premium Duty" },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" },
    "notes": { "type": "string" }
  },
  "required": ["normalized_chain_id", "source_part_number"]
}
```

### 1.5 Chain_Attachments
```json
{
  "name": "Chain_Attachments",
  "properties": {
    "attachment_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "attachment_code": { "type": "string" },
    "attachment_type": { "type": "string" },
    "attachment_side": { "type": "string", "description": "Top / Bottom / Both" },
    "spacing": { "type": "string" },
    "dimensions": { "type": "string", "description": "JSON geometry data" },
    "drawing_url": { "type": "string" },
    "image_url": { "type": "string" },
    "compatible_chain_numbers": { "type": "array", "items": { "type": "string" } },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" }
  },
  "required": ["normalized_chain_id", "attachment_code"]
}
```

### 1.6 Chain_Sprockets
```json
{
  "name": "Chain_Sprockets",
  "properties": {
    "sprocket_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "sprocket_series": { "type": "string" },
    "tooth_count": { "type": "integer" },
    "bore_type": { "type": "string" },
    "material": { "type": "string" },
    "hardened": { "type": "boolean" },
    "split": { "type": "boolean" },
    "drawing_url": { "type": "string" },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" }
  },
  "required": ["normalized_chain_id", "sprocket_series"]
}
```

### 1.7 Chain_Media
```json
{
  "name": "Chain_Media",
  "properties": {
    "media_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "media_type": { "type": "string", "enum": ["image_product", "image_drawing", "image_attachment", "diagram"] },
    "image_url": { "type": "string" },
    "drawing_url": { "type": "string" },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" },
    "notes": { "type": "string" }
  },
  "required": ["normalized_chain_id", "media_type"]
}
```

### 1.8 Chain_Downloads
```json
{
  "name": "Chain_Downloads",
  "properties": {
    "download_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "download_type": { "type": "string", "enum": ["catalog_pdf", "spec_sheet", "drawing", "technical_doc"] },
    "title": { "type": "string" },
    "url": { "type": "string" },
    "source_catalog": { "type": "string" },
    "source_page": { "type": "string" }
  },
  "required": ["normalized_chain_id", "download_type"]
}
```

### 1.9 Chain_Review_Flags
```json
{
  "name": "Chain_Review_Flags",
  "properties": {
    "flag_id": { "type": "string" },
    "normalized_chain_id": { "type": "string", "description": "FK to Normalized_Chains" },
    "issue_type": { "type": "string", "enum": ["conflicting_data", "missing_specs", "confidence_low", "source_mismatch", "needs_verification"] },
    "description": { "type": "string" },
    "conflicting_sources": { "type": "array", "items": { "type": "string" } },
    "recommended_action": { "type": "string" },
    "status": { "type": "string", "enum": ["Open", "In Review", "Resolved"] },
    "created_date": { "type": "string", "format": "date-time" },
    "resolved_date": { "type": "string", "format": "date-time" }
  },
  "required": ["normalized_chain_id", "issue_type"]
}
```

---

## 2. RELATIONSHIP DIAGRAM

```
Normalized_Chains (Core Hub)
├── 1:N Chain_Dimensions
│   └── Source data per manufacturer
├── 1:N Manufacturer_Equivalents
│   └── Brand equivalency mapping
├── 1:N Performance_Data
│   └── Performance tiers per source
├── 1:N Chain_Attachments
│   └── Attachment compatibility
├── 1:N Chain_Sprockets
│   └── Compatible sprocket specs
├── 1:N Chain_Media
│   └── Images & drawings
├── 1:N Chain_Downloads
│   └── PDF & technical docs
└── 1:N Chain_Review_Flags
    └── Data quality tracking
```

**Key Principle:** Normalized_Chains acts as the single source of truth (canonical reference). All related data is normalized and deduplicated through this core entity.

---

## 3. MIGRATION RISK ASSESSMENT

### High Risk Areas
| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Data Loss in Merge** | Critical - Combining 4 manufacturers into 1 table may lose variance | Create detailed equivalency mapping before merge; parallel run comparison reports |
| **Breaking Existing Search** | High - UI searches on `chainNormalizedIndex.js` | Phase 1: Keep static file as read-only cache; Phase 2: Switch search to entity queries gradually |
| **RFQ Cart References** | High - RFQ items link by normalized_chain_id | Audit all RFQ storage/retrieval code; ensure IDs remain stable |
| **URL Slugs & Links** | Medium - Deep links to chain specs | Maintain slug mapping table; 301 redirects if needed |

### Medium Risk Areas
- Performance under 10,000+ records (mitigate with proper indexing on `normalized_chain_id`, `chain_family`, `status`)
- Concurrent edit conflicts on shared records (RLS & versioning strategy needed)
- Historical data integrity (some static records lack source attribution)

### Low Risk Areas
- Table Top Chain, Modular Belting, Wire Mesh (completely separate ecosystems)
- Conveyor Rollers (separate entity, RollerConfigurator untouched)
- 4B Monitoring (separate ecosystem)
- Global RFQ behavior (will be compatible with entity-based lookup)

---

## 4. SAFEST STAGED MIGRATION PLAN

### Stage 0: Preparation (Week 1-2)
**No code changes yet. Planning only.**

1. **Data Audit & Cleansing**
   - Deduplication: Identify all duplicate chain entries across static files
   - Standardization: Normalize all pitch/diameter values to mm + in
   - Source Attribution: Tag every record with origin (Allied Locke, Donghua, Uniking, etc.)
   - Gap Analysis: Document missing specs/images

2. **Equivalency Mapping**
   - Create canonical normalized_chain_id mapping for every chain variant
   - Map all manufacturer part numbers to canonical IDs
   - Document conflicts and ambiguities

3. **RFQ Audit**
   - Review how RFQ cart currently stores/retrieves chain data
   - Identify all hardcoded references to static files
   - Map RFQ query patterns to future entity queries

### Stage 1: Entity Creation (Week 3)
**Create entities in Base44; do not delete static files yet.**

1. Create all 9 entities (empty schema, no data)
2. Enable read permissions for public browsing
3. Set up proper indexes on:
   - `Normalized_Chains.normalized_chain_id`
   - `Normalized_Chains.chain_family`
   - `Chain_Dimensions.source_manufacturer`
   - `Manufacturer_Equivalents.manufacturer`

### Stage 2: Pilot Data Load (Week 4)
**Load 1-2 chain families into entities as test.**

1. Select ANSI Roller Chains (most complete, widest use)
2. Load all normalized + equivalencies + dimensions
3. Run parallel queries: static file vs. entities
4. Compare result sets for data integrity
5. Fix mapping issues before proceeding

### Stage 3: Component Adapter Layer (Week 5-6)
**Write abstraction layer; keep UI unchanged.**

Create `lib/chainEntityAdapter.js`:
- `getChainById(id)` - queries entity instead of static file
- `searchChains(query)` - full-text entity search
- `getEquivalents(id, manufacturer)` - lookup equivalencies
- Fallback to static files if entity returns empty (backwards compatible)

Update key files to use adapter:
- `components/chains/ChainCatalog.jsx`
- `components/chains/platform/ChainFamilyBrowser.jsx`
- `components/chains/platform/ChainDetailView.jsx`
- `lib/chainEquivalencyEngine.js` (wrap existing logic)

**No UI changes; business logic unchanged.**

### Stage 4: Full Data Migration (Week 7-8)
**Load remaining chain families into entities.**

1. Load remaining ANSI variants
2. Load Donghua chains
3. Load Engineered/Welded/Pintle chains
4. Load Bucket Elevator chains
5. Monitor data quality; use Chain_Review_Flags to track issues

### Stage 5: Search & Discovery Cutover (Week 9)
**Switch HomeGlobalSearch & catalog browsing to entity queries.**

1. Update `components/HomeGlobalSearch.jsx` to query Normalized_Chains
2. Update ChainCatalog view components to fetch from entities
3. A/B test: old static results vs. new entity results
4. Maintain both paths for 1 week, then disable static fallback

### Stage 6: RFQ Cutover (Week 10)
**Update RFQ storage to reference normalized_chain_id.**

1. Audit current RFQ structure
2. Update RFQ add/edit logic to store normalized_chain_id instead of inline data
3. Fetch chain details on-demand from entities
4. Migrate existing RFQ carts if needed

### Stage 7: Cleanup (Week 11+)
**Mark static files as deprecated; archive/delete gradually.**

1. Move to separate `_archived/` folder first
2. Keep for 2-3 weeks as safety net
3. Delete only after confirming zero references

---

## 5. FILES/ENTITIES TO EVENTUALLY REPLACE

### Will be completely replaced
| Static File | Reason | New Source |
|-------------|--------|-----------|
| `lib/chainNormalizedDictionary.js` | Core normalized data → Normalized_Chains entity | Entity query |
| `lib/chainNormalizedExpansion.js` | Expanded specs → Chain_Dimensions entity | Entity query |
| `lib/chainNormalizedExpansion2.js` | Additional specs → Chain_Dimensions entity | Entity query |
| `lib/donghuaPhase4Expansion.js` | Donghua source data → Manufacturer_Equivalents + Chain_Dimensions | Entity query |
| `lib/donghuaDeepExpansion.js` | Donghua performance data → Performance_Data entity | Entity query |
| `lib/donghuaNormalizedChains.js` | Donghua normalized → Normalized_Chains (merged) | Entity query |
| `lib/ansiRollerChainExpansion.js` | ANSI expansions → Normalized_Chains + Chain_Dimensions | Entity query |
| `lib/alliedLockeSourceRecord.js` | Allied Locke source → Manufacturer_Equivalents + Performance_Data | Entity query |
| `lib/unikingBulkChains.js` | Uniking bulk data → Normalized_Chains + Chain_Dimensions | Entity query |
| `lib/unikingBulkSourceRecord.js` | Uniking source → Manufacturer_Equivalents | Entity query |
| `lib/chainAttachmentLibrary.js` | Attachment specs → Chain_Attachments entity | Entity query |
| `lib/chainSprocketCompatibility.js` | Sprocket compatibility → Chain_Sprockets entity | Entity query |
| `lib/chainPinsLinksLibrary.js` | Pins/links data → Chain_Attachments (variant) | Entity query |

### Will be significantly refactored (not deleted)
| File | Why | Changes |
|------|-----|---------|
| `lib/chainNormalizedIndex.js` | Query layer still useful for caching/perf | Becomes thin wrapper over entity queries + local in-memory cache for fast lookup |
| `lib/chainEquivalencyEngine.js` | Equivalency logic still needed | Refactored to query Manufacturer_Equivalents entity instead of static index |
| `lib/chainImportEngine.js` | Data import logic → becomes admin tool | Import source data into entities instead of JS files |

### Will stay unchanged (isolated ecosystems)
| File/Component | Reason |
|---|---|
| All Table Top Chain files | Separate product ecosystem |
| All Modular Belting (Intralox, SystemPlast, MovEX) | Separate ecosystems |
| All Wire Mesh files | Separate ecosystem |
| All 4B Monitoring files | Separate ecosystem |
| All Conveyor Roller files (RollerConfigurator, Series 1100-3950) | Different data model |
| All Elevator Bucket files (ElevBucketsView) | Different data model |

---

## 6. WHAT CAN STAY UNCHANGED FOR NOW

### Safe to Ignore During Migration
1. **UI/Component Structure** - Views remain identical; only data source changes
2. **RFQ Workflow** - Cart logic stays same; just references entities instead of objects
3. **Search Indexing** - Can use Base44's built-in full-text search
4. **Performance Optimization** - Entity queries can be indexed same as static arrays
5. **Global Navigation** - Home.jsx, Catalog.jsx remain untouched
6. **Auth & RLS** - Can apply after entities created; not blocking factor

### Strategies to Avoid Breaking Changes
- **Adapter Pattern**: All entity queries go through `chainEntityAdapter.js`
- **Fallback Logic**: If entity returns empty, fall back to static file briefly
- **ID Stability**: `normalized_chain_id` values never change across migration
- **Parallel Running**: Keep static files during Stages 1-5, delete only in Stage 7
- **Feature Flags**: Gate entity queries behind config flag during pilot (easy rollback)

---

## 7. EXECUTION DEPENDENCY MAP

```
Stage 0: Data Audit & Equivalency Mapping
    ↓
Stage 1: Entity Schema Creation (9 entities)
    ↓
Stage 2: Pilot Load (ANSI chains only)
    ↓
Stage 3: Adapter Layer + Gradual Component Cutover
    ├─ No new code in static files after this point
    ├─ All new features query entities
    └─ Static files locked in read-only
    ↓
Stage 4: Full Data Load (all chain families)
    ↓
Stage 5: Search & Discovery Switch
    ↓
Stage 6: RFQ Cutover
    ↓
Stage 7: Archive & Delete Static Files
```

**Critical Gate:** Do NOT proceed past Stage 2 until data integrity is verified.

---

## 8. SUCCESS CRITERIA

✓ All 10,000+ chain records loadable into entities  
✓ Zero data loss in normalization process  
✓ Query performance ≤ 200ms for single lookups  
✓ RFQ cart functionality unchanged from user perspective  
✓ No hardcoded paths to static JS files remain in active code  
✓ Chain_Review_Flags entity catching all data quality issues  
✓ Static files completely archived (not deleted initially)  
✓ Full rollback possible until Stage 6 completion  

---

**NEXT STEP:** User approval to proceed to Stage 0 data audit.