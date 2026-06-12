#!/usr/bin/env python3
"""
extract_uniking_eng_class_2023.py

Faithful, reviewable extraction of:
  Uniking Canada — Engineered Class Chains Catalog 2023 (5pp, book pp.99-103)

Source PDF text was pulled with PyMuPDF; dimension columns were reconciled by
hand against the raw text because the catalog's multi-column table layout does
not extract cleanly. Values are kept EXACTLY as printed (mixed-fraction inches);
pitch is also given as decimal inches + mm for computability. Blank catalog
cells are omitted rather than guessed.

Emits:
  registry/sources/uniking-engineered-class-2023.json   (authoritative raw record)
  registry/families/steel-bushed-chains.json            (5 NEW normalized records)

The 3 chains already in the catalog (81X / 81X-HD / 81X-XHD) are recorded as
ENRICHMENT targets, not duplicated.  Run: python3 registry/extract_uniking_eng_class_2023.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CATALOG = "Uniking Canada — Engineered Class Chains Catalog 2023"

def mm(pitch_in):  # decimal inches -> mm string, 2dp
    return f"{pitch_in * 25.4:.2f}"

# ── Curated extraction. dims = exactly as printed (inches, fractions as text) ──
# section codes: SB = Steel Bushed (p.100); SBR-S = Steel Bushed Roller Straight
# Sidebar (p.101 top); SBR-O = Steel Bushed Roller Offset Sidebar (p.101 bottom)
CHAINS = [
    # part, pitch_in, ultimate_lbs, links_per_ft, weight_per_ft, page, section, dims, status
    ("MS188",   2.609, 25000, "4.6", "3.8", 100, "SB",
        {"outer_sidebar_thickness":"1/4","inner_sidebar_thickness":"1/4","rivet_diameter":"1/2",
         "overall_width":"2 11/16","max_sprocket_thickness":"1","length_of_bearing":"1 9/16"}, "new"),
    ("MS131",   3.075, 40000, "3.9", "8.3", 100, "SB",
        {"sidebar_height":"1 1/2","overall_width":"3 9/16","length_of_bearing":"2","bushing_diameter":"1 1/4"}, "new"),
    ("MS102B",  4.000, 40000, "3.0", "6.9", 100, "SB",
        {"sidebar_height":"1 1/2","overall_width":"4 11/32","max_sprocket_thickness":"2","bushing_diameter":"1"}, "new"),
    ("MS110",   6.000, 40000, "2.0", "6.3", 100, "SB",
        {"sidebar_height":"1 1/2","overall_width":"4 11/32","max_sprocket_thickness":"2","bushing_diameter":"1 1/4"}, "new"),
    ("LXS882",  2.609, 29000, "4.6", "3.6", 101, "SBR-O",
        {"sidebar_thickness":"1/4","rivet_diameter":"7/16","overall_width":"2 1/2","length_of_bearing":"1 21/32"}, "new"),
    # already in catalog from Donghua — enrichment targets, not new
    ("81X",     2.609, 24000, "4.6", "2.6", 101, "SBR-S",
        {"outer_sidebar_thickness":"5/32","inner_sidebar_thickness":"5/32","rivet_diameter":"7/16","roller_diameter":"29/32"},
        "enrich:81X (existing pitch 3.000 is WRONG -> 2.609)"),
    ("81X-HD",  2.609, 42800, "4.6", "4.0", 101, "SBR-S",
        {"sidebar_height":"1 1/4","outer_sidebar_thickness":"7/32","inner_sidebar_thickness":"5/16","rivet_diameter":"7/16",
         "overall_width":"2 9/16","length_of_bearing":"1 11/16","roller_diameter":"29/32"}, "enrich:81XH"),
    ("81X-XHD", 2.609, 42800, "4.6", "4.5", 101, "SBR-S",
        {"sidebar_height":"1 1/4","outer_sidebar_thickness":"5/16","inner_sidebar_thickness":"5/16","rivet_diameter":"7/16",
         "overall_width":"2 3/4","roller_diameter":"29/32"}, "enrich:81XHH"),
]

SECTION_LABEL = {
    "SB":   "Steel Bushed",
    "SBR-S":"Steel, Bushed, Roller — Straight Sidebar",
    "SBR-O":"Steel, Bushed, Roller — Offset Sidebar",
}
CONSTRUCTION = ["Fully heat-treated superior alloy steel","Solid bushings and rollers","Quad staked rivet design"]

ATTACHMENTS = [
    {"code":"A1","style":"Lug one side","holes":1,"for":["MS188","MS131","MS102B","MS110"],"page":103},
    {"code":"A2","style":"Lug one side","holes":2,"for":["MS188","MS131","MS102B","MS110"],"page":103},
    {"code":"K1","style":"Lugs both sides","holes":1,"for":["MS188","MS131","MS102B","MS110"],"page":103},
    {"code":"K2","style":"Lugs both sides","holes":2,"for":["MS188","MS131","MS102B","MS110"],"page":103},
]

def build_source_record():
    items = []
    for part, p_in, ult, lpf, wpf, page, section, dims, status in CHAINS:
        items.append({
            "part_number": part, "section": SECTION_LABEL[section], "catalog_page": page,
            "pitch_in": f"{p_in:.3f}", "pitch_mm": mm(p_in),
            "avg_ultimate_strength_lbs": ult, "links_per_foot": lpf,
            "avg_weight_per_foot_lbs": wpf, "dimensions_in": dims,
            "disposition": status,
        })
    return {
        "source": CATALOG, "manufacturer": "Uniking", "year": 2023,
        "book_pages": "99-103", "extracted_with": "PyMuPDF + manual column reconciliation",
        "notes": "Engineered class steel bushed chains. Dimensions exactly as printed (inches). "
                 "All construction: " + "; ".join(CONSTRUCTION) + ".",
        "construction": CONSTRUCTION,
        "chains": items,
        "attachments": ATTACHMENTS,
    }

def normalized_record(part, p_in, ult, lpf, wpf, page, section, dims):
    atts = [a["code"] for a in ATTACHMENTS if part in a["for"]]
    return {
        "chain_id": part,
        "chain_family": "Steel Bushed Chains",
        "chain_number": part,
        "display_name": f"{part} Steel Bushed Engineered Class Chain",
        "standard": "",  # not stated in source catalog — left blank rather than guessed
        "pitch_in": f"{p_in:.3f}",
        "pitch_mm": mm(p_in),
        "strands": 1,
        "description": f"Engineered class steel bushed chain ({SECTION_LABEL[section]}). "
                       f"{p_in:.3f}\" pitch, {ult:,} lb avg ultimate strength. "
                       f"{'; '.join(CONSTRUCTION)}.",
        "application_tags": ["Engineered Class","Steel Bushed","Heavy Duty"],
        "materials_available": ["alloy_steel"],
        "options_upgrades": (("Attachments: " + ", ".join(atts)) if atts else ""),
        "image_url": "", "drawing_url": "",
        "status": "Active", "needs_review": False,
        "uniking_notes": f"Source: {CATALOG}, book p.{page}. Standard not specified in catalog.",
        # ── registry-native enrichment ──
        "specs": {"pitch_in": f"{p_in:.3f}", "pitch_mm": mm(p_in),
                  "avg_ultimate_lbs": str(ult), "links_per_foot": lpf,
                  "avg_weight_per_foot_lbs": wpf, **dims},
        "performance_tiers": [{"tier":"standard","tensile_strength_lbs":str(ult),
                               "source": f"{CATALOG} p.{page}"}],
        "source_refs": [{"manufacturer":"Uniking","code":part,"confidence":"Confirmed",
                         "catalog_page":str(page),"notes":CATALOG}],
        "attachments_available": atts,
        "sprocket_series": part,
        "image_strategy": "family",
        "_origin": "uniking_eng_class_2023_pdf",
        "_family_key": "steel_bushed",
        "_family_unmapped": False,
        "provenance": "catalog-verified",
    }

def main():
    os.makedirs(os.path.join(HERE, "sources"), exist_ok=True)
    # 1. source record
    with open(os.path.join(HERE, "sources", "uniking-engineered-class-2023.json"), "w") as f:
        json.dump(build_source_record(), f, indent=2); f.write("\n")
    # 2. populate Steel Bushed family with the 5 NEW records
    new = [normalized_record(*c[:8]) for c in CHAINS if c[8] == "new"]
    new.sort(key=lambda r: r["chain_id"])
    fam = {"family":"Steel Bushed Chains","slug":"steel-bushed-chains","count":len(new),"chains":new}
    with open(os.path.join(HERE, "families", "steel-bushed-chains.json"), "w") as f:
        json.dump(fam, f, indent=2); f.write("\n")
    enrich = [c for c in CHAINS if c[8] != "new"]
    print(f"Source record: {len(CHAINS)} chains + {len(ATTACHMENTS)} attachments")
    print(f"Steel Bushed family: {len(new)} NEW records -> {[r['chain_id'] for r in new]}")
    print(f"Enrichment (already in catalog, not duplicated): {[c[0] for c in enrich]}")

if __name__ == "__main__":
    main()
