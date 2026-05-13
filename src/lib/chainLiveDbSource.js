/**
 * chainLiveDbSource.js
 * 
 * Provides the authoritative live DB source for normalized chains.
 * This is used by Home search, Chain Platform search, and family pages.
 * Always fetches fresh DB records (status: Active or blank).
 */

import { base44 } from "@/api/base44Client";
import { ALL_NORMALIZED_CHAINS } from "./chainNormalizedIndex";

/**
 * Fetch live DB chains (Active status) and merge with static fallback.
 * DB-first: takes priority over ALL_NORMALIZED_CHAINS for same chain_id.
 * Returns merged, deduped array ready for search/display.
 */
export async function fetchLiveNormalizedChains() {
  let dbChains = [];
  let skip = 0;
  while (true) {
    try {
      const batch = await base44.entities.Normalized_Chains.filter(
        { status: "Active" },
        "-created_date",
        500,
        skip
      );
      if (!batch?.length) break;
      dbChains = [...dbChains, ...batch];
      if (batch.length < 500) break;
      skip += batch.length;
    } catch {
      break; // If fetch fails, use what we have
    }
  }

  // Merge: DB takes priority for same chain_id, static is fallback
  const staticChains = ALL_NORMALIZED_CHAINS;
  const validDb = dbChains.filter(r => !r.status || r.status === "Active");
  const mergedMap = new Map();

  for (const r of validDb) {
    if (r.chain_id) mergedMap.set(r.chain_id, { ...r, _from_db: true });
  }
  for (const c of staticChains) {
    if (!mergedMap.has(c.chain_id)) mergedMap.set(c.chain_id, c);
  }

  const merged = [...mergedMap.values()];

  return {
    live: merged,
    dbRecords: validDb.length,
    staticFallback: staticChains.length,
    totalSearchable: merged.length,
  };
}

/**
 * Get live chains synchronously (for cached/memoized contexts).
 * Falls back to ALL_NORMALIZED_CHAINS if DB not yet loaded.
 * Must be called after useEffect that loads live data.
 */
export function getLiveChainsSync(cachedLive = null) {
  // If caller has cached live data from fetchLiveNormalizedChains, use it
  if (cachedLive?.live && Array.isArray(cachedLive.live)) {
    return cachedLive.live;
  }
  // Otherwise fallback to static (this is for backward compat during hydration)
  return ALL_NORMALIZED_CHAINS;
}