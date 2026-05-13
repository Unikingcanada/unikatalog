# ARCHIVE: Legacy Chain Platforms (Allied Locke, Mac Chain, Donghua)

**Date Archived:** 2026-05-13  
**Status:** Superseded by Normalized Chain Procurement Platform  
**Retention:** Keep for historical reference and potential recovery

## What's Here

This archive documents the legacy chain product platforms that have been replaced by the unified, normalized chain database:

### Files Removed from Active Routing:
- `components/chains/ChainCatalogHome.jsx` — Legacy chain category selector (ANSI/BS, Engineered, Welded Steel, etc.)
- `components/chains/ChainCategoryView.jsx` — Category detail view with product filtering
- `components/chains/ChainProductDetail.jsx` — Individual product spec detail view
- `components/chains/ChainProductCard.jsx` — Product card UI component
- `lib/chainCatalogData.js` — Static chain category and product reference data
- `lib/chainDataRoller.js` — ANSI roller chain data (static)
- `lib/chainDataEngineered.js` — Engineered chain data (static)
- `pages/WeldedSteel.jsx` — Welded steel chain dedicated page
- `pages/SpecialChains.jsx` — Specialty chain page
- `pages/DonghuaChain.jsx` — Donghua chain page

### Components Still in Code (Disabled but Available):
- `components/catalog/MacProductModal.jsx` — Mac chain product detail modal
- `lib/alliedLockeSourceRecord.js` — Allied Locke source data reference
- `lib/donghuaSourceRecord.js` — Donghua source data reference
- `lib/unikingBulkSourceRecord.js` — Uniking bulk catalog reference

### Legacy Import Statements (in Home.jsx, commented out):
All Allied, Mac, and legacy Donghua imports have been commented out but remain in the codebase for easy recovery.

## Why Archived

1. **Single Source of Truth:** Normalized_Chains DB is now the authoritative chain catalog
2. **Data Integrity:** All supplier equivalencies tracked in Raw_Chain_Imports for traceability
3. **Exact-Match Merging Only:** No fuzzy or AI-driven chain consolidation—all relationships reviewable
4. **Future-Proof:** Simplified routing prevents accidental logic inheritance from legacy platforms

## Recovery Instructions

If legacy platforms need to be restored:

1. Uncomment imports in `pages/Home.jsx` (search for `// ARCHIVED:`)
2. Restore routing logic in `selectType()` function
3. Re-enable `ChainCatalog` intermediate view in routing
4. Search for `// LEGACY_PLATFORM_DISABLED` markers in component files

## Contact

For questions about archived data structures or historical chain records, refer to:
- `CHECKPOINT_2026-05-06.md` — Last snapshot before normalization consolidation
- `STAGE_0_*` reports — Conflict matrix, authority resolution, equivalency ambiguity

---

**Normalized Chain Platform:** `components/chains/platform/ChainPlatformView.jsx`  
**Data Source:** `Normalized_Chains` entity + `Raw_Chain_Imports` (staging)