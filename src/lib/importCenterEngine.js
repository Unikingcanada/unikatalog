/**
 * importCenterEngine.js
 * Core parsing, validation, and commit logic for the Import Center.
 * Pure utility — no React dependencies.
 *
 * Architecture Extension Points (AI layer — future):
 *   - autoMapColumns(headers, entityTarget) → suggested mapping
 *   - suggestEquivalencies(stagedRecord) → candidate matches
 *   - scoreConfidence(mappedRecord) → 0-1 confidence
 *   - mergeDuplicates(stagedRecord, existingRecord) → merged record
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const ENTITY_TARGETS = [
  "Normalized_Chains",
  "Chain_Dimensions",
  "Manufacturer_Equivalents",
  "Performance_Data",
  "Chain_Attachments",
  "Chain_Sprockets",
  "Chain_Downloads",
  "Chain_Media",
  "Chain_Review_Flags",
];

export const STATUS_COLORS = {
  New:       { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e" },
  Duplicate: { bg: "#fefce8", border: "#fde047", text: "#854d0e", dot: "#eab308" },
  Changed:   { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", dot: "#3b82f6" },
  Conflict:  { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", dot: "#ef4444" },
  FK_Fail:   { bg: "#fdf4ff", border: "#d8b4fe", text: "#6b21a8", dot: "#a855f7" },
  Invalid:   { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#f97316" },
  Committed: { bg: "#f0fdf4", border: "#6ee7b7", text: "#065f46", dot: "#10b981" },
  Skipped:   { bg: "#f8fafc", border: "#cbd5e1", text: "#64748b", dot: "#94a3b8" },
  Failed:    { bg: "#fef2f2", border: "#fca5a5", text: "#7f1d1d", dot: "#dc2626" },
  Pending:   { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", dot: "#94a3b8" },
};

export const SESSION_STATUS_COLORS = {
  Uploading:           "#3b82f6",
  Staged:              "#8b5cf6",
  Validating:          "#f59e0b",
  "Pending Review":    "#f97316",
  Committing:          "#06b6d4",
  Committed:           "#22c55e",
  "Partially Committed": "#84cc16",
  "Rolled Back":       "#6b7280",
  Failed:              "#ef4444",
  Cancelled:           "#94a3b8",
};

// ─── Session ID Generator ─────────────────────────────────────────────────────

export function generateSessionId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IMP-${ymd}-${rand}`;
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    if (vals.every(v => !v)) continue; // skip blank rows
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] ?? ''; });
    rows.push(obj);
  }
  return { headers, rows };
}

// ─── JSON Parser ──────────────────────────────────────────────────────────────

export function parseJSON(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : (data.records || data.data || [data]);
  if (arr.length === 0) return { headers: [], rows: [] };
  const headers = [...new Set(arr.flatMap(r => Object.keys(r)))];
  return { headers, rows: arr };
}

// ─── XLSX Parser (SheetJS) ────────────────────────────────────────────────────

import * as XLSX from 'xlsx';

/**
 * Parse an XLSX ArrayBuffer → array of worksheets, each with { name, headers, rows }.
 * Returns all sheets so the UI can let the user pick one.
 */
export function parseXLSX(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  return wb.SheetNames.map(name => {
    const ws = wb.Sheets[name];
    // sheet_to_json with header:1 gives raw 2D array — first row = headers
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (raw.length < 2) return { name, headers: [], rows: [] };

    const headers = raw[0].map(h => String(h).trim()).filter(Boolean);
    const rows = [];
    for (let i = 1; i < raw.length; i++) {
      const rowArr = raw[i];
      // Skip completely empty rows
      if (rowArr.every(v => v === '' || v === null || v === undefined)) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        const val = rowArr[idx];
        // Convert Date objects to ISO string
        obj[h] = val instanceof Date ? val.toISOString() : (val ?? '');
      });
      rows.push(obj);
    }
    return { name, headers, rows };
  });
}

// ─── Array Fields Registry ────────────────────────────────────────────────────
// Fields whose entity schema type is array/multi-select.
// Incoming delimited strings are auto-coerced to arrays before commit.

// Explicit list of fields that should be coerced from delimited strings to arrays.
const ARRAY_FIELDS = new Set([
  'application_tags',
  'materials_available',
]);

/** Returns true if a target field should hold an array value. */
function isArrayField(fieldName) {
  return ARRAY_FIELDS.has(fieldName);
}

/** Split a delimited string into a trimmed, non-empty string array. */
function splitDelimited(str) {
  // Prefer | first, then ; then , (comma is last because it appears in normal text)
  const delimiter = str.includes('|') ? '|' : str.includes(';') ? ';' : ',';
  return str.split(delimiter).map(s => s.trim()).filter(Boolean);
}

// ─── Apply Column Mapping ─────────────────────────────────────────────────────

export function applyMapping(row, mappingRules, transformRules = {}) {
  const mapped = {};
  Object.entries(mappingRules).forEach(([srcCol, targetField]) => {
    if (!targetField) return;
    let val = row[srcCol];
    if (val === undefined || val === '') return;

    const transform = transformRules[srcCol];
    if (transform === 'parseFloat') val = parseFloat(val) || null;
    else if (transform === 'parseInt') val = parseInt(val) || null;
    else if (transform === 'toUpperCase') val = String(val).toUpperCase();
    else if (transform === 'toLowerCase') val = String(val).toLowerCase();
    else if (transform === 'trim') val = String(val).trim();
    else if (transform === 'boolean') val = ['true','yes','1','y'].includes(String(val).toLowerCase());

    // ── Array coercion ───────────────────────────────────────────────────────
    // If the destination field is an array type and the value is still a string,
    // auto-split on |, ; or , delimiters before committing.
    if (isArrayField(targetField) && typeof val === 'string') {
      val = splitDelimited(val);
    }

    mapped[targetField] = val;
  });
  return mapped;
}

// ─── Validation Engine ────────────────────────────────────────────────────────

/**
 * Classify a staged record against existing production data.
 * Returns { status, conflictDetail, diffSummary, productionRecordId }
 *
 * @param {object} mappedData - The mapped row
 * @param {string} entityTarget - e.g. "Normalized_Chains"
 * @param {object[]} existingRecords - Already-fetched production records for this entity
 */
export function classifyRecord(mappedData, entityTarget, existingRecords) {
  // Determine primary key field per entity
  const pkField = getPrimaryKey(entityTarget);
  const pkValue = mappedData[pkField];

  // ── Component-SKU pre-check (Normalized_Chains only) ─────────────────────────
  // Reject component-style SKUs (OL-xx, CL-xx, etc.) before they reach production.
  if (entityTarget === 'Normalized_Chains' && isComponentSku(mappedData.chain_id, mappedData.chain_number)) {
    const parentSize = parseParentChainSize(mappedData.chain_id || mappedData.chain_number);
    return {
      status: 'Invalid',
      conflictDetail: `Component/accessory SKU "${mappedData.chain_id || mappedData.chain_number}" cannot be stored as a Normalized_Chain. Likely an Offset Link, Connecting Link, or attachment.${parentSize ? ` Probable parent: ANSI-${parentSize}.` : ''} Use Chain_Attachments entity instead.`,
      diffSummary: null,
      productionRecordId: null,
    };
  }

  // FK validation — check required fields
  const requiredFields = getRequiredFields(entityTarget);
  for (const f of requiredFields) {
    if (!mappedData[f] && mappedData[f] !== 0) {
      return { status: 'Invalid', conflictDetail: `Missing required field: ${f}`, diffSummary: null, productionRecordId: null };
    }
  }

  if (!pkValue) {
    return { status: 'Invalid', conflictDetail: `Missing primary key field: ${pkField}`, diffSummary: null, productionRecordId: null };
  }

  const existing = existingRecords.find(r => r[pkField] === pkValue);
  if (!existing) {
    return { status: 'New', conflictDetail: null, diffSummary: null, productionRecordId: null };
  }

  // Detect changes
  const diffSummary = {};
  let hasChanges = false;
  let hasConflicts = false;
  const conflictFields = getDimensionalFields(entityTarget);

  Object.entries(mappedData).forEach(([field, newVal]) => {
    const oldVal = existing[field];
    if (oldVal !== undefined && oldVal !== null && oldVal !== '' && newVal !== null && newVal !== undefined && newVal !== '') {
      if (String(oldVal) !== String(newVal)) {
        diffSummary[field] = { old: oldVal, new: newVal };
        hasChanges = true;
        if (conflictFields.includes(field)) hasConflicts = true;
      }
    }
  });

  if (hasConflicts) {
    return { status: 'Conflict', conflictDetail: `Dimensional conflict in: ${Object.keys(diffSummary).filter(f => conflictFields.includes(f)).join(', ')}`, diffSummary, productionRecordId: existing.id };
  }
  if (hasChanges) {
    return { status: 'Changed', conflictDetail: null, diffSummary, productionRecordId: existing.id };
  }
  return { status: 'Duplicate', conflictDetail: 'Exact match found in production', diffSummary: null, productionRecordId: existing.id };
}

// ─── Governance Helpers ───────────────────────────────────────────────────────

function getPrimaryKey(entityTarget) {
  const pkMap = {
    Normalized_Chains:        'chain_id',
    Chain_Dimensions:         'chain_id',
    Manufacturer_Equivalents: 'brand_part_number',
    Performance_Data:         'chain_id',
    Chain_Attachments:        'attachment_code',
    Chain_Sprockets:          'sprocket_code',
    Chain_Downloads:          'label',
    Chain_Media:              'url',
    Chain_Review_Flags:       'chain_id',
  };
  return pkMap[entityTarget] || 'id';
}

function getRequiredFields(entityTarget) {
  const reqMap = {
    Normalized_Chains:        ['chain_id', 'chain_family', 'chain_number'],
    Chain_Dimensions:         ['chain_id'],
    Manufacturer_Equivalents: ['chain_id', 'brand', 'brand_part_number'],
    Performance_Data:         ['chain_id'],
    Chain_Attachments:        ['chain_id', 'attachment_code'],
    Chain_Sprockets:          ['chain_id', 'sprocket_code'],
    Chain_Downloads:          ['chain_id', 'label', 'url'],
    Chain_Media:              ['chain_id', 'url'],
    Chain_Review_Flags:       ['chain_id', 'flag_type'],
  };
  return reqMap[entityTarget] || [];
}

function getDimensionalFields(entityTarget) {
  // Fields where conflicts trigger 'Conflict' rather than 'Changed'
  const dimMap = {
    Chain_Dimensions: ['pitch_mm','pitch_in','roller_dia_mm','roller_dia_in','pin_dia_mm','inner_width_mm'],
    Normalized_Chains: ['pitch_in','pitch_mm'],
    Performance_Data: ['tensile_strength_lbs','tensile_strength_kn','working_load_lbs'],
  };
  return dimMap[entityTarget] || [];
}

// ─── Component-SKU Detection ─────────────────────────────────────────────────

/**
 * Patterns that identify a SKU as a chain component/accessory rather than a standalone chain.
 * These should NEVER be imported as Normalized_Chains records.
 *
 * Examples:
 *   OL-80, OL80, C/L 80, CL-80, CL80, A-1 80, K1-80, SA2-80, OFFSET LINK 80,
 *   CONN LINK 80, CONNECTING LINK 80, 80 COTTER PIN, 80 MASTER LINK
 */
const COMPONENT_SKU_PATTERNS = [
  /^OL[-\s]?\d/i,               // OL-80, OL80, OL 80
  /^C\/L[-\s]?\d/i,              // C/L-80, C/L 80
  /^CL[-\s]?\d/i,                // CL-80, CL80
  /^offset\s*link/i,             // Offset Link 80
  /^connecting\s*link/i,         // Connecting Link 80
  /^conn(?:ecting)?\s*link/i,    // Conn Link 80
  /^master\s*link/i,             // Master Link 80
  /\boffset\s*link\b/i,          // anything containing "offset link"
  /\bconn(?:ecting)?\s*link\b/i, // anything containing "connecting link"
  /^(A|K|SA|WA|SK|HK|WK)-?\d+\s+\d/i,  // A1 80, K-1 80 (attachment code + chain size)
  /\bcotter\s*pin\b/i,           // Cotter Pin
  /\bspring\s*clip\b/i,          // Spring Clip
  /\bmaster\s*link\b/i,          // Master Link
];

/**
 * Returns true if the chain_id or chain_number looks like a component/accessory SKU
 * that should NOT be stored as a standalone Normalized_Chains record.
 */
export function isComponentSku(chainId, chainNumber) {
  const ids = [chainId, chainNumber].filter(Boolean);
  return ids.some(id => COMPONENT_SKU_PATTERNS.some(pat => pat.test(String(id))));
}

/**
 * Parse the parent ANSI chain size from a component SKU.
 * e.g. "OL-80" → "80", "CL-60" → "60", "A1-80" → "80"
 * Returns null if not parseable.
 */
export function parseParentChainSize(sku) {
  if (!sku) return null;
  const m = String(sku).match(/(\d+)$/);
  return m ? m[1] : null;
}

// ─── Auto-Flag Generator ──────────────────────────────────────────────────────

/**
 * Trusted source brands whose catalogs are considered authoritative for governance rules.
 * H-series downgrade rule only applies when source_brand is in this list.
 */
const TRUSTED_BRANDS = [
  'Tsubaki', 'Donghua', 'Regina', 'Allied Locke', 'Renold', 'Rexnord',
  'Iwis', 'Diamond', 'Drives', 'Ramsey', 'Webster', 'HKK', 'KettenWulf',
];

/**
 * Returns true if the chain_id represents a heavy-series (H-suffix) ANSI chain.
 * Matches patterns like "40H", "80H", "100H", "ANSI-80H", "C2060H" etc.
 */
function isHSeriesChain(chainId) {
  return typeof chainId === 'string' && /H$/i.test(chainId.trim());
}

/**
 * Given a classified staged record, generate review flags if needed.
 * Returns array of flag objects (or empty).
 */
export function generateAutoFlags(mappedData, status, conflictDetail, entityTarget) {
  const flags = [];
  const chainId = mappedData.chain_id || mappedData.brand_part_number || '?';

  // ── Component-SKU governance rule ────────────────────────────────────────────
  // If this looks like a component/link (OL-xx, CL-xx, etc.) being imported into
  // Normalized_Chains, flag it immediately — it should go to Chain_Attachments or
  // a component-specific entity instead.
  if (entityTarget === 'Normalized_Chains' && isComponentSku(mappedData.chain_id, mappedData.chain_number)) {
    const parentSize = parseParentChainSize(mappedData.chain_id || mappedData.chain_number);
    flags.push({
      chain_id: chainId,
      flag_type: 'Data Entry Error',
      severity: 'Critical',
      description: `Component/accessory SKU "${chainId}" imported as a standalone chain record. This appears to be an Offset Link, Connecting Link, or attachment — not a parent chain. ${parentSize ? `Probable parent chain: ANSI-${parentSize}.` : ''} Move to Chain_Attachments or Chain_Downloads, or delete this record.`,
      affected_field: 'chain_id',
      needs_review: true,
      review_status: 'Pending',
    });
  }

  if (status === 'Conflict') {
    flags.push({
      chain_id: chainId,
      flag_type: 'Conflicting Specs',
      severity: 'High',
      description: `Import conflict: ${conflictDetail}`,
      needs_review: true,
      review_status: 'Pending',
    });
  }
  if (entityTarget === 'Chain_Dimensions') {
    const dimFields = ['pitch_mm','roller_dia_mm','pin_dia_mm','inner_width_mm'];
    const missing = dimFields.filter(f => !mappedData[f] && mappedData[f] !== 0);
    if (missing.length > 0) {
      flags.push({
        chain_id: chainId,
        flag_type: 'Missing Dimensions',
        severity: 'Critical',
        description: `Missing dimension fields: ${missing.join(', ')}`,
        affected_field: missing.join(', '),
        needs_review: true,
        review_status: 'Pending',
      });
    }
  }
  if (entityTarget === 'Manufacturer_Equivalents' && !mappedData.equivalency_type) {
    // ── H-series governance rule ──────────────────────────────────────────────
    // If the chain_id ends with "H", source_brand is trusted, and there was no
    // duplicate or merge action (status === 'New'), downgrade severity High → Medium
    // and auto-suggest a resolution note. Flag is still raised for traceability.
    const sourceBrandTrusted = TRUSTED_BRANDS.some(
      b => (mappedData.source_brand || mappedData.brand || '').toLowerCase().includes(b.toLowerCase())
    );
    const isHSeries  = isHSeriesChain(chainId);
    const isStandalone = status === 'New'; // no duplicate / merge occurred

    const severity = (isHSeries && sourceBrandTrusted && isStandalone) ? 'Medium' : 'High';
    const autoNote = (isHSeries && sourceBrandTrusted && isStandalone)
      ? 'Heavy-series chain verified as standalone SKU. Auto-governance: H-suffix + trusted brand + no duplicate detected.'
      : null;

    flags.push({
      chain_id: mappedData.chain_id || chainId,
      flag_type: 'Unverified Equivalency',
      severity,
      description: 'Equivalency imported without equivalency_type classification.',
      ...(autoNote ? { resolution_notes: autoNote } : {}),
      needs_review: true,
      review_status: 'Pending',
    });
  }

  // ── H-series rule on Normalized_Chains (Unverified Equivalency context) ──
  // If a Normalized_Chains record is New, has H-suffix, trusted brand — generate
  // a lightweight Unverified Equivalency flag at Medium with auto-resolution hint.
  if (entityTarget === 'Normalized_Chains' && status === 'New') {
    const sourceBrandTrusted = TRUSTED_BRANDS.some(
      b => (mappedData.source_brand || '').toLowerCase().includes(b.toLowerCase())
    );
    if (isHSeriesChain(chainId) && sourceBrandTrusted) {
      flags.push({
        chain_id: chainId,
        flag_type: 'Unverified Equivalency',
        severity: 'Medium',  // explicitly Medium — not High — per H-series governance rule
        description: 'H-series chain imported as standalone SKU. Equivalency to base series not yet classified.',
        resolution_notes: 'Heavy-series chain verified as standalone SKU. Auto-governance: H-suffix + trusted brand + no duplicate detected.',
        needs_review: true,
        review_status: 'Pending',
      });
    }
  }

  return flags;
}

// ─── Chunked Commit Engine ───────────────────────────────────────────────────

export const CHUNK_SIZE = 50;

/**
 * Splits records into chunks for progressive writing.
 */
export function chunkArray(arr, size = CHUNK_SIZE) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Builds a rollback snapshot from the production records that will be overwritten.
 * Captures full original state — used to restore on rollback.
 * Structure: { entity, timestamp, snapshots: [{ productionId, originalData }] }
 */
export function buildRollbackSnapshot(entityTarget, affectedRecords) {
  return {
    entity: entityTarget,
    timestamp: new Date().toISOString(),
    snapshots: affectedRecords.map(r => ({
      productionId: r.id,
      originalData: { ...r },
    })),
  };
}

// ─── AI Extension Points (Placeholders) ─────────────────────────────────────

/**
 * FUTURE: Auto-map source columns to entity fields using LLM.
 * @param {string[]} headers - Detected column headers
 * @param {string} entityTarget - Target entity
 * @returns {object} mappingRules suggestion
 */
export async function autoMapColumns_FUTURE(headers, entityTarget) {
  // TODO: Call InvokeLLM with headers + entity schema
  throw new Error('AI mapping not yet implemented');
}

/**
 * FUTURE: Suggest equivalency candidates for a staged chain record.
 * @param {object} mappedRecord
 * @returns {object[]} candidate matches with confidence
 */
export async function suggestEquivalencies_FUTURE(mappedRecord) {
  throw new Error('AI equivalency suggestions not yet implemented');
}

/**
 * FUTURE: Score confidence for a mapped record.
 * @param {object} mappedRecord
 * @returns {number} 0-1 confidence score
 */
export async function scoreConfidence_FUTURE(mappedRecord) {
  throw new Error('AI confidence scoring not yet implemented');
}