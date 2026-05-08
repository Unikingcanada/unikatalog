/**
 * chainWave2ImportEngine.js
 *
 * Wave 2 Bulk Import Pipeline — Chains Ecosystem Only
 * ====================================================
 * Extends the base chainImportEngine with:
 *  1. CSV parsing (flat rows → structured records)
 *  2. DB-backed duplicate detection (checks live Normalized_Chains + child entities)
 *  3. Pre-commit relationship validation (chain_id must exist in DB)
 *  4. Automatic review-flag generation for known risk patterns
 *  5. Batch commit pipeline (writes validated records to DB entities)
 *
 * ALL operations are preview-first — nothing writes until commitBatch() is called.
 * Governance rules from Wave 1 are enforced at every step.
 */

import { base44 } from "@/api/base44Client";

// ─── Supported Target Entities ────────────────────────────────────────────────
export const IMPORT_TARGETS = {
  normalized_chains:       "Normalized_Chains",
  manufacturer_equivalents: "Manufacturer_Equivalents",
  chain_dimensions:        "Chain_Dimensions",
  performance_data:        "Performance_Data",
  chain_attachments:       "Chain_Attachments",
  chain_sprockets:         "Chain_Sprockets",
  chain_media:             "Chain_Media",
  chain_review_flags:      "Chain_Review_Flags",
};

// ─── CSV Parser ───────────────────────────────────────────────────────────────
/**
 * parseCSV
 * Converts a CSV string to an array of plain objects.
 * - First row = headers
 * - Empty cells become null
 * - Numeric strings are coerced to numbers
 * - Quoted fields with commas are handled
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return { records: [], errors: ["CSV has no data rows."] };

  const errors = [];

  function parseLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  }

  const headers = parseLine(lines[0]).map(h => h.trim());

  // Validate no duplicate headers
  const headerSet = new Set(headers);
  if (headerSet.size !== headers.length) {
    errors.push("Duplicate column headers detected — check your CSV.");
  }

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const record = {};
    headers.forEach((h, idx) => {
      let val = values[idx] !== undefined ? values[idx].trim() : null;
      if (val === "" || val === "—" || val === "-" || val === "N/A") val = null;
      // Coerce numeric strings
      if (val !== null && !isNaN(val) && val !== "") val = Number(val);
      record[h] = val;
    });
    records.push(record);
  }

  return { records, errors, headers, rowCount: records.length };
}

// ─── DB-Backed Duplicate Detector ────────────────────────────────────────────
/**
 * fetchExistingKeys
 * Loads existing records from a target entity and builds a Set of dedup keys.
 * Returns { keySet, records } — keySet is used for O(1) duplicate checks.
 *
 * Dedup strategy per entity:
 *  - Normalized_Chains:        chain_id
 *  - Manufacturer_Equivalents: chain_id + brand + brand_part_number
 *  - Chain_Dimensions:         chain_id + source_brand
 *  - Performance_Data:         chain_id + tier + source_brand
 *  - Chain_Attachments:        chain_id + attachment_code
 *  - Chain_Sprockets:          chain_id + sprocket_code
 *  - Chain_Media:              chain_id + url
 *  - Chain_Review_Flags:       chain_id + flag_type + description (first 60 chars)
 */
export async function fetchExistingKeys(entityName) {
  let all = [];
  let skip = 0;
  while (true) {
    const batch = await base44.entities[entityName].list("-created_date", 500, skip);
    if (!batch || !batch.length) break;
    all = [...all, ...batch];
    if (batch.length < 500) break;
    skip += batch.length;
  }

  const keySet = new Set();
  for (const r of all) {
    const k = buildDedupKey(entityName, r);
    if (k) keySet.add(k);
  }

  return { keySet, records: all, count: all.length };
}

function buildDedupKey(entityName, r) {
  switch (entityName) {
    case "Normalized_Chains":
      return r.chain_id?.toLowerCase() || null;
    case "Manufacturer_Equivalents":
      return `${r.chain_id}|${r.brand}|${r.brand_part_number}`.toLowerCase();
    case "Chain_Dimensions":
      return `${r.chain_id}|${r.source_brand || ""}`.toLowerCase();
    case "Performance_Data":
      return `${r.chain_id}|${r.tier || ""}|${r.source_brand || ""}`.toLowerCase();
    case "Chain_Attachments":
      return `${r.chain_id}|${r.attachment_code}`.toLowerCase();
    case "Chain_Sprockets":
      return `${r.chain_id}|${r.sprocket_code}`.toLowerCase();
    case "Chain_Media":
      return `${r.chain_id}|${r.url}`.toLowerCase();
    case "Chain_Review_Flags":
      return `${r.chain_id}|${r.flag_type}|${(r.description || "").slice(0, 60)}`.toLowerCase();
    default:
      return null;
  }
}

export function isDuplicateRecord(entityName, record, keySet) {
  const k = buildDedupKey(entityName, record);
  if (!k) return false;
  return keySet.has(k);
}

// ─── Relationship Validator ───────────────────────────────────────────────────
/**
 * validateRelationships
 * For child entities (anything that has a chain_id FK), checks that
 * every chain_id in the incoming batch exists in the live Normalized_Chains DB.
 * Returns { valid: bool, errors: [], warnings: [] }
 */
export async function validateRelationships(records, entityName) {
  const result = { valid: true, errors: [], warnings: [] };

  // Normalized_Chains has no FK — skip
  if (entityName === "Normalized_Chains") return result;

  // Load existing chain IDs from DB
  let chainIds = new Set();
  try {
    const { keySet } = await fetchExistingKeys("Normalized_Chains");
    chainIds = keySet;
  } catch {
    result.warnings.push("Could not load Normalized_Chains from DB — relationship check skipped.");
    return result;
  }

  const missing = [];
  for (const r of records) {
    if (!r.chain_id) {
      result.errors.push(`Record missing required chain_id field: ${JSON.stringify(r).slice(0, 80)}`);
      result.valid = false;
    } else if (!chainIds.has(r.chain_id.toLowerCase())) {
      missing.push(r.chain_id);
    }
  }

  if (missing.length > 0) {
    const unique = [...new Set(missing)];
    result.errors.push(`${unique.length} chain_id(s) not found in Normalized_Chains: ${unique.join(", ")}`);
    result.valid = false;
  }

  return result;
}

// ─── Auto Review Flag Generator ──────────────────────────────────────────────
/**
 * generateAutoFlags
 * Scans incoming records and produces Chain_Review_Flags entries
 * for known risk patterns. Returns an array of flag objects (not yet written).
 *
 * Risk patterns detected:
 *  1. Engineering family conflicts (WH/WR/WD mixed)
 *  2. Missing critical dimensions (pitch required)
 *  3. Conflicting standards (ANSI vs ISO on same chain_id)
 *  4. Overhead compatibility risk (OH- prefix chains)
 *  5. Heavy vs standard series ambiguity (H suffix)
 *  6. Stainless Steel variant isolation
 */
export function generateAutoFlags(records, entityName) {
  const flags = [];

  function addFlag(chain_id, flag_type, severity, description, extra = {}) {
    flags.push({
      chain_id,
      flag_type,
      severity,
      description,
      resolved: false,
      needs_review: true,
      review_status: "Pending",
      assigned_to: "Engineering",
      ...extra,
    });
  }

  for (const r of records) {
    const cid = r.chain_id || r.chain_number || "";

    // 1. Engineering family conflict — WH/WR/WD must stay isolated
    if (/^(WH|WR|WD)/i.test(cid)) {
      const family = cid.match(/^(WH|WR|WD)/i)?.[1]?.toUpperCase();
      addFlag(cid, "Conflicting Specs", "High",
        `Engineering family isolation required: ${family} series must not be merged with other WH/WR/WD families. Verify chain_id assignment before commit.`,
        { affected_field: "chain_id", source_a: "Engineering Rule", value_a: "WH/WR/WD isolation required" }
      );
    }

    // 2. Missing critical dimensions (Chain_Dimensions entity)
    if (entityName === "Chain_Dimensions" || entityName === "Normalized_Chains") {
      const hasPitch = r.pitch_in != null || r.pitch_mm != null;
      if (!hasPitch) {
        addFlag(cid, "Missing Dimensions", "Critical",
          `Record for ${cid} has no pitch data (pitch_in or pitch_mm). Pitch is required for all chain dimension records.`,
          { affected_field: "pitch_in / pitch_mm" }
        );
      }
    }

    // 3. Conflicting standards — ANSI chain_id with ISO/BS spec fields
    if (entityName === "Manufacturer_Equivalents" || entityName === "Normalized_Chains") {
      const isANSI = /^ANSI-/i.test(cid);
      const isISO = r.standard && /ISO|BS|DIN/i.test(r.standard);
      if (isANSI && isISO) {
        addFlag(cid, "Conflicting Specs", "High",
          `ANSI chain_id (${cid}) has an ISO/BS/DIN standard field. ANSI and ISO chains must not be merged. Verify standard and chain_id are compatible.`,
          { affected_field: "standard", source_a: "chain_id", value_a: cid, source_b: "standard", value_b: r.standard }
        );
      }
    }

    // 4. Overhead compatibility risk
    if (/^OH-/i.test(cid)) {
      addFlag(cid, "Unverified Equivalency", "Critical",
        `Overhead chain ${cid}: trolley and track system compatibility must be verified before equivalency mapping. Do not assume interchangeability.`,
        { affected_field: "trolley compatibility" }
      );
    }

    // 5. Heavy series ambiguity (H suffix) — must not merge with standard
    if (/H$/i.test(cid) && !/^OH-/i.test(cid)) {
      addFlag(cid, "Unverified Equivalency", "High",
        `Chain ${cid} has H (heavy) suffix. Heavy series must remain isolated from standard series with the same base number. Verify no auto-merge with ${cid.replace(/H$/i, "")}.`,
        { affected_field: "chain_id", source_a: "Heavy Series Rule", value_a: cid, source_b: "Standard Series", value_b: cid.replace(/H$/i, "") }
      );
    }

    // 6. Stainless Steel variant — must not inherit carbon steel performance data
    if (r.materials_available?.includes?.("Stainless Steel") ||
        (typeof r.materials_available === "string" && /stainless/i.test(r.materials_available)) ||
        /SS$/i.test(cid)) {
      addFlag(cid, "Conflicting Specs", "Medium",
        `Stainless Steel variant detected for ${cid}. Performance data (tensile, working load) must not inherit from carbon steel records. Verify all performance_data source_brand entries.`,
        { affected_field: "materials_available / performance_data" }
      );
    }
  }

  return flags;
}

// ─── Pre-Commit Validation Pipeline ──────────────────────────────────────────
/**
 * validateBatchForCommit
 * Full pre-flight check before writing to DB.
 * Returns a structured ValidationReport.
 */
export async function validateBatchForCommit(records, entityName) {
  const report = {
    entityName,
    total: records.length,
    valid: true,
    errors: [],
    warnings: [],
    duplicates: [],
    autoFlags: [],
    relationshipErrors: [],
    readyToCommit: [],
    skipped: [],
  };

  // Step 1: Basic field validation
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (entityName === "Normalized_Chains" && !r.chain_id) {
      report.errors.push(`Row ${i + 1}: Missing required field chain_id`);
      report.valid = false;
    }
    if (entityName === "Normalized_Chains" && !r.chain_family) {
      report.errors.push(`Row ${i + 1}: Missing required field chain_family`);
      report.valid = false;
    }
    if (entityName !== "Normalized_Chains" && !r.chain_id) {
      report.errors.push(`Row ${i + 1}: Missing required field chain_id (FK)`);
      report.valid = false;
    }
  }

  if (!report.valid) return report;

  // Step 2: DB duplicate detection
  let keySet = new Set();
  try {
    const existing = await fetchExistingKeys(entityName);
    keySet = existing.keySet;
    report.existingCount = existing.count;
  } catch (e) {
    report.warnings.push(`Duplicate check failed (${e.message}) — proceeding without dedup.`);
  }

  for (const r of records) {
    if (isDuplicateRecord(entityName, r, keySet)) {
      report.duplicates.push(r);
      report.skipped.push({ record: r, reason: "Duplicate — already exists in DB" });
    } else {
      report.readyToCommit.push(r);
    }
  }

  // Step 3: Relationship validation
  if (entityName !== "Normalized_Chains") {
    const relCheck = await validateRelationships(report.readyToCommit, entityName);
    if (!relCheck.valid) {
      report.valid = false;
      report.relationshipErrors = relCheck.errors;
      report.errors.push(...relCheck.errors);
    }
    report.warnings.push(...relCheck.warnings);
  }

  // Step 4: Auto-flag generation (non-blocking — flags go to review queue)
  report.autoFlags = generateAutoFlags(report.readyToCommit, entityName);

  return report;
}

// ─── Batch Commit Pipeline ────────────────────────────────────────────────────
/**
 * commitBatch
 * Writes validated records to the target entity.
 * Also writes any auto-generated review flags.
 * Returns a CommitResult with counts and any errors.
 *
 * ONLY call after validateBatchForCommit() returns valid: true.
 */
export async function commitBatch(validationReport) {
  const result = {
    entityName: validationReport.entityName,
    committed: 0,
    skipped: validationReport.skipped.length,
    flagsCreated: 0,
    errors: [],
    success: false,
    timestamp: new Date().toISOString(),
  };

  if (!validationReport.valid) {
    result.errors.push("Cannot commit — validation report has errors. Fix errors and re-validate.");
    return result;
  }

  const toWrite = validationReport.readyToCommit;
  if (toWrite.length === 0) {
    result.errors.push("No new records to commit after dedup — all rows were duplicates.");
    result.success = true;
    return result;
  }

  // Write in chunks of 50 to avoid timeouts on large batches
  const CHUNK_SIZE = 50;
  for (let i = 0; i < toWrite.length; i += CHUNK_SIZE) {
    const chunk = toWrite.slice(i, i + CHUNK_SIZE);
    try {
      await base44.entities[validationReport.entityName].bulkCreate(chunk);
      result.committed += chunk.length;
    } catch (e) {
      result.errors.push(`Chunk ${Math.floor(i / CHUNK_SIZE) + 1} failed: ${e.message}`);
    }
  }

  // Write auto-generated review flags
  if (validationReport.autoFlags.length > 0) {
    // Deduplicate flags against existing flags before writing
    try {
      const { keySet: flagKeys } = await fetchExistingKeys("Chain_Review_Flags");
      const newFlags = validationReport.autoFlags.filter(f => !isDuplicateRecord("Chain_Review_Flags", f, flagKeys));

      for (let i = 0; i < newFlags.length; i += CHUNK_SIZE) {
        const chunk = newFlags.slice(i, i + CHUNK_SIZE);
        await base44.entities["Chain_Review_Flags"].bulkCreate(chunk);
        result.flagsCreated += chunk.length;
      }
    } catch (e) {
      result.errors.push(`Flag creation failed: ${e.message}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

// ─── CSV Column Mapper ────────────────────────────────────────────────────────
/**
 * COLUMN_MAPS
 * Known CSV column → entity field mappings per target entity.
 * Handles common header variations from different source catalogs.
 */
export const COLUMN_MAPS = {
  Normalized_Chains: {
    "chain_id": "chain_id", "Chain ID": "chain_id", "ID": "chain_id",
    "chain_number": "chain_number", "Chain No": "chain_number", "Chain Number": "chain_number",
    "chain_family": "chain_family", "Family": "chain_family",
    "display_name": "display_name", "Name": "display_name",
    "standard": "standard", "Standard": "standard",
    "pitch_in": "pitch_in", "Pitch (in)": "pitch_in", "Pitch In": "pitch_in",
    "pitch_mm": "pitch_mm", "Pitch (mm)": "pitch_mm", "Pitch MM": "pitch_mm",
    "description": "description", "Description": "description",
  },
  Manufacturer_Equivalents: {
    "chain_id": "chain_id", "Chain ID": "chain_id",
    "brand": "brand", "Brand": "brand", "Manufacturer": "brand",
    "brand_part_number": "brand_part_number", "Part Number": "brand_part_number", "Mfr Part No": "brand_part_number",
    "brand_series": "brand_series", "Series": "brand_series",
    "equivalency_type": "equivalency_type", "Equiv Type": "equivalency_type",
    "confidence": "confidence", "Confidence": "confidence",
    "notes": "notes", "Notes": "notes",
  },
  Chain_Dimensions: {
    "chain_id": "chain_id", "Chain ID": "chain_id",
    "pitch_in": "pitch_in", "Pitch (in)": "pitch_in",
    "pitch_mm": "pitch_mm", "Pitch (mm)": "pitch_mm",
    "roller_dia_in": "roller_dia_in", "Roller Dia (in)": "roller_dia_in",
    "roller_dia_mm": "roller_dia_mm", "Roller Dia (mm)": "roller_dia_mm",
    "roller_width_in": "roller_width_in", "Inner Width (in)": "roller_width_in",
    "roller_width_mm": "roller_width_mm", "Inner Width (mm)": "roller_width_mm",
    "pin_dia_in": "pin_dia_in", "Pin Dia (in)": "pin_dia_in",
    "pin_dia_mm": "pin_dia_mm", "Pin Dia (mm)": "pin_dia_mm",
    "plate_height_in": "plate_height_in", "Plate Height (in)": "plate_height_in",
    "plate_height_mm": "plate_height_mm", "Plate Height (mm)": "plate_height_mm",
    "plate_thickness_in": "plate_thickness_in", "Plate Thick (in)": "plate_thickness_in",
    "plate_thickness_mm": "plate_thickness_mm", "Plate Thick (mm)": "plate_thickness_mm",
    "weight_lbs_ft": "weight_lbs_ft", "Weight (lbs/ft)": "weight_lbs_ft",
    "weight_kg_m": "weight_kg_m", "Weight (kg/m)": "weight_kg_m",
    "standard": "standard", "Standard": "standard",
    "source_brand": "source_brand", "Source": "source_brand",
    "notes": "notes", "Notes": "notes",
  },
  Performance_Data: {
    "chain_id": "chain_id", "Chain ID": "chain_id",
    "tier": "tier", "Tier": "tier",
    "tensile_strength_lbs": "tensile_strength_lbs", "Tensile (lbs)": "tensile_strength_lbs",
    "tensile_strength_kn": "tensile_strength_kn", "Tensile (kN)": "tensile_strength_kn",
    "working_load_lbs": "working_load_lbs", "Working Load (lbs)": "working_load_lbs",
    "working_load_kn": "working_load_kn", "Working Load (kN)": "working_load_kn",
    "source_brand": "source_brand", "Source": "source_brand",
    "notes": "notes", "Notes": "notes",
  },
  Chain_Review_Flags: {
    "chain_id": "chain_id", "Chain ID": "chain_id",
    "flag_type": "flag_type", "Flag Type": "flag_type",
    "severity": "severity", "Severity": "severity",
    "description": "description", "Description": "description",
    "affected_field": "affected_field", "Affected Field": "affected_field",
    "source_a": "source_a", "Source A": "source_a",
    "value_a": "value_a", "Value A": "value_a",
    "source_b": "source_b", "Source B": "source_b",
    "value_b": "value_b", "Value B": "value_b",
    "assigned_to": "assigned_to", "Assigned To": "assigned_to",
  },
};

/**
 * remapColumns
 * Applies a COLUMN_MAP to remap incoming CSV headers to entity field names.
 */
export function remapColumns(records, entityName) {
  const map = COLUMN_MAPS[entityName];
  if (!map) return records; // No map — pass through as-is

  return records.map(r => {
    const remapped = {};
    for (const [col, val] of Object.entries(r)) {
      const targetField = map[col] || col; // Use map if available, else keep original
      remapped[targetField] = val;
    }
    return remapped;
  });
}