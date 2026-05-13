# Chains-Only Import Architecture v2

## Overview
Strict chains-only import system with 7-layer protection against duplicates, bad relationships, and invisible records.

**Core Rule**: Exact `chain_id` match only. NO fuzzy matching. NO AI merge.

---

## 1. Duplicate Prevention / Upsert Logic

**File**: `lib/chainImportValidator.js`

### Behavior:
- **New `chain_id`** → Create
- **Existing `chain_id`** → Mark as "Existing" / Needs Review
- **Exact duplicate within batch** → Skip
- **Deduplication key**: `chain_id` only (exact match, case-sensitive)

### Function: `validateChainImport(stagedRecords, opts)`

```javascript
// Returns:
{
  valid: [...],           // Ready to commit
  new: [...],             // New records
  existing: [...],        // Already in DB — needs approval to update
  duplicates: [...],      // Same chain_id in batch
  invalid: [...],         // Missing required fields
  orphanRisks: [...],     // Related entity risks
  summary: { ... }        // Counts
}
```

---

## 2. Dry Run Import Mode

**Component**: `components/importCenter/ICSessionWorkflow`
**Button**: "🔍 Dry Run / Validate Only" (Chains only, mapped in ICColumnMapper)

### What it does:
1. Parse uploaded file(s)
2. Apply column mapping
3. Map rows to chain record shape
4. Fetch existing chains from DB
5. Run full validation (no writes)
6. Check orphan risks
7. Show pre-commit summary
8. **User can export issues as CSV**

### Dry run does NOT:
- Write to staging layer
- Create or update any records
- Fire background jobs
- Save session to DB

---

## 3. Pre-Commit Summary Screen

**Component**: `components/importCenter/ChainImportSummary.jsx`

### Displays:
- ✅ New records (count + preview)
- ℹ️ Existing records detected (requires approval)
- ⚠️ Duplicates in batch
- ❌ Invalid rows (missing fields)
- ⚠️ Orphan relationship risks

### Requires Admin Confirmation:
Checkbox: **"I understand and approve this commit"**

### Commit Strategy Options:
- **Commit New Only** (default) — Create new, skip existing
- **Commit All Valid** — Create new + update existing

### Bulk Actions:
- Export Issues (CSV)
- Skip All Existing
- Retry Failed Validation

---

## 4. Relationship Safety

**File**: `lib/chainImportValidator.js` → `checkOrphanRisks(chainIds)`

### Checks related entities:
- `Chain_Dimensions`
- `Performance_Data`
- `Manufacturer_Equivalents`
- `Chain_Attachments`
- `Chain_Sprockets`
- `Chain_Media`
- `Chain_Downloads`

### Before commit:
1. Verify `chain_id` exists in `Normalized_Chains`
2. If NOT found → Mark as **Orphan Risk**
3. Do NOT block commit, but flag for manual review
4. Generate review flags for orphan rows

---

## 5. Import Dashboard Indicators

**Page**: `/admin/chains-audit` (updated)

### Session States Shown:
- 📊 Uploading
- ✅ Staged
- 🔍 Validating
- ⚠️ Pending Review
- 💾 Committing
- ✓ Committed
- ⚠️ Partially Committed
- ↩️ Rolled Back
- ❌ Failed
- ✗ Cancelled

### Per-Session Display:
- Session ID
- Manufacturer
- Status badge
- Total rows
- Rows written
- Flags generated
- Upload date

---

## 6. Audit Visibility

**Page**: `/admin/chains-audit`

### Metrics:
- Total DB records (including duplicates)
- Unique `chain_id`s
- Visible active chains (authoritative)
- Duplicate records ignored
- Orphan risks (by entity)
- Pending review flags
- Recent import sessions (6 most recent)

---

## 7. Workflow Steps

```
Step 0: Upload
  └─→ Select manufacturer + source catalog
      Select file(s) [CSV/XLSX/JSON]

Step 1: Configure Mapping
  └─→ Auto-suggest column mappings
      Save/Load named mappings
      [NEW] "🔍 Dry Run" button (Chains only)
      OR "Apply Mapping & Stage" (live)

Step 1B (Optional): Dry Run Path
  └─→ Validate without writing
      Show summary (new/existing/duplicates/invalid/orphans)
      Export issues
      Back to Configure (no session created)

Step 2: Staging & Validation (server-side)
  └─→ Chunk-loop processes rows
      Non-fatal chunk errors shown
      Session status updates in real-time

Step 3: Review & Commit
  └─→ Per-record decisions
      Summary stats
      Bulk actions
      Fire commit job

Step 4: Commit Monitor
  └─→ Poll server status
      Show progress
      Rollback snapshot available
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/chainImportValidator.js` | Validation engine, orphan checking, review flag generation |
| `components/importCenter/ChainImportSummary.jsx` | Pre-commit screen with admin approval |
| `components/importCenter/ICSessionWorkflow` | Main workflow, dry-run integration |
| `components/importCenter/ICColumnMapper` | Column mapping UI + dry-run button |
| `pages/ChainsAudit` | Dashboard with import session indicators |
| `functions/importStageJob` | (existing) Server-side staging |
| `functions/importCommitJob` | (existing) Server-side commit |

---

## Safety Guarantees

### After this architecture:
✅ No duplicate `chain_id`s in production (exact match dedup)
✅ No invisible records (all rows reviewed before commit)
✅ No bad relationships (orphan checking before commit)
✅ Full audit trail (import sessions logged with status)
✅ Rollback available (snapshot on every commit)
✅ Dry-run validation (zero risk for testing)
✅ Admin approval required (explicit confirmation before commit)

### Ready for:
- Real supplier catalog batch imports (Tsubaki, Donghua, Regina, etc.)
- Mass data migration
- Safe bulk updates with approval workflow
- Zero-tolerance duplicate policy

---

## Testing

1. **Dry Run Test**:
   - Upload test file → Configure mapping → Click "Dry Run"
   - Verify summary shows new/existing/invalid correctly
   - Export issues CSV
   - Go back (no session created)

2. **Live Commit Test**:
   - Upload → Configure → "Apply Mapping & Stage"
   - Verify staging completes
   - Check review screen
   - Accept terms → Commit
   - Monitor progress
   - Verify rows in DB

3. **Duplicate Prevention Test**:
   - Upload file with duplicate `chain_id`
   - Dry run or staging should flag
   - Summary should show duplicates
   - Commit should skip them

4. **Orphan Detection Test**:
   - Upload dimensions for non-existent chain
   - Dry run should flag as orphan risk
   - Summary should show count
   - Commit should tag for review

---

## Next Steps

After deployment:
1. Test dry-run with a small CSV (5-10 rows)
2. Run full staging test
3. Try commit with "new only" mode
4. Verify audit dashboard shows sessions
5. Start real supplier imports with confidence