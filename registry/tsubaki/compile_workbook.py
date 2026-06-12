#!/usr/bin/env python3
"""Compile master chain registry (xlsx or CSV) -> validated Base44 import packs.
Usage: python3 compile_workbook.py REGISTRY.xlsx|PKG-XX.csv [outdir]
Refuses to emit files if any validation error exists."""
import sys, json, re
import pandas as pd
from collections import Counter

FAMILIES = {"Performance Roller Chains","Conveyor Roller Chains","Attachment Roller Chains",
    "Hollow Pin Chains","Double Pitch Conveyor Chains","Engineered Class Chains",
    "Welded Steel Chains","Steel Pintle Chains","Steel Bushed Chains",
    "Agricultural Conveyor Chains","SharpTop Chains","Forged Chains",
    "Drop Forged Rivetless Chains","Overhead Conveyor Chains","Drag / Scraper Chains",
    "Bucket Elevator Chains","Leaf Chains","Specialty / Custom Chains"}
STATUSES = {"Active","Pending Review","Discontinued","On Request"}
# Updated per PKG-01f addendum. NOTE: matching is substring (`b in blob`), so
# "titan" also flags the legitimate material "titanium" — recommend word-boundary
# matching before running against real data. Tuple updated exactly as instructed.
BANNED = ("lambda","neptune","xceeder","x-ceeder","titan","titanxl","speed master",
    "speedmaster","iron hawk","ironhawk","shuttle hawk","shuttlehawk","sj3","sj2")
BRAND_LABEL = {"pn_tsubaki":"Tsubaki","pn_donghua":"Donghua","pn_alliedlocke":"Allied-Locke",
    "pn_renold":"Renold","pn_rexnord":"Rexnord","pn_iwis":"iwis","pn_wippermann":"Wippermann",
    "pn_regina":"Regina","pn_peer":"Peer","pn_linkbelt":"Link-Belt","pn_macchain":"MAC Chain",
    "pn_senqcia":"Senqcia","pn_daido":"Daido","pn_morse":"Morse","pn_johnking":"John King",
    "pn_webster":"Webster","pn_canam":"Can-Am","pn_uniking":"Uniking",
    "pn_kobo":"KOBO","pn_connexus":"Connexus","pn_4b":"4B","pn_heko":"HEKO",
    "pn_kettenwulf":"KettenWulf","pn_jeffrey":"Jeffrey","pn_amh":"AMH"}

def s(v):
    if pd.isna(v): return ""
    if isinstance(v,float) and v == int(v): return str(int(v))
    return str(v).strip()

def main(path, outdir="."):
    if path.lower().endswith(".csv"):
        df = pd.read_csv(path, dtype=str)
    else:
        df = pd.read_excel(path, sheet_name="MASTER", dtype=str)
    errors, warnings = [], []
    ids = [s(v) for v in df["chain_id"]]
    for cid,n in Counter(i for i in ids if i).items():
        if n > 1: errors.append(f"DUPLICATE chain_id: {cid} ({n}x)")

    nc, eq, dims, perf, flags = [], [], [], [], []
    for i,row in df.iterrows():
        r = {k: s(v) for k,v in row.items()}
        cid = r["chain_id"]; ln = i+2
        if not cid: errors.append(f"Row {ln}: blank chain_id"); continue
        if r["chain_family"] not in FAMILIES:
            errors.append(f"Row {ln} ({cid}): invalid family '{r['chain_family']}'")
        if r["status"] and r["status"] not in STATUSES:
            errors.append(f"Row {ln} ({cid}): invalid status '{r['status']}'")
        if not r["chain_number"]: errors.append(f"Row {ln} ({cid}): blank chain_number")
        pi, pm = r["pitch_in"], r["pitch_mm"]
        try:
            if pi and pm and abs(float(pm)-float(pi)*25.4) > max(0.6,float(pm)*0.02):
                warnings.append(f"{cid}: pitch mismatch in={pi} mm={pm}")
        except ValueError: errors.append(f"Row {ln} ({cid}): unparseable pitch")
        blob = json.dumps(r).lower()
        for b in BANNED:
            if b in blob: errors.append(f"Row {ln} ({cid}): banned coating ref '{b}'")
        try: strands = int(float(r["strands"] or "1"))
        except ValueError: errors.append(f"Row {ln} ({cid}): bad strands"); strands = 1

        nc.append({"chain_id":cid,"chain_family":r["chain_family"],"chain_number":r["chain_number"],
            "display_name":r["display_name"],"standard":r["standard"],
            "pitch_in":pi,"pitch_mm":pm,"strands":strands,"description":r["description"],
            "application_tags":[t.strip() for t in r["application_tags"].split(",") if t.strip()],
            "materials_available":[t.strip() for t in r["materials_available"].split(",") if t.strip()],
            "options_upgrades":r["options_upgrades"],"image_url":r["image_url"],
            "drawing_url":r["drawing_url"],"status":r["status"] or "Active",
            "needs_review":r["needs_review"].upper() == "TRUE",
            "uniking_notes":(r["uniking_notes"] + f" [provenance: {r['provenance']}]").strip()})
        for col,brand in BRAND_LABEL.items():
            if r.get(col):
                eq.append({"chain_id":cid,"brand":brand,"brand_part_number":r[col],
                    "brand_series":"","equivalency_type":"Direct",
                    "confidence":"High" if r["provenance"] in ("standard-nominal","catalog-verified") else "Medium"})
        if any(r.get(k) for k in ("roller_dia_in","pin_dia_in","plate_height_in","weight_lbs_ft","inner_width_in")):
            d = {"chain_id":cid,"pitch_in":pi,"pitch_mm":pm,
                "roller_diameter_in":r["roller_dia_in"],"roller_diameter_mm":r["roller_dia_mm"],
                "inner_width_in":r["inner_width_in"],"inner_width_mm":r["inner_width_mm"],
                "pin_diameter_in":r["pin_dia_in"],"pin_diameter_mm":r["pin_dia_mm"],
                "plate_height_in":r["plate_height_in"],"plate_height_mm":r["plate_height_mm"],
                "weight_lbs_ft":r["weight_lbs_ft"],"weight_kg_m":r["weight_kg_m"],
                "standard":r["standard"],"source_brand":r["perf_source"]}
            if r["extra_dims_json"]:
                try: d["extra_dims"] = json.loads(r["extra_dims_json"])
                except json.JSONDecodeError: errors.append(f"Row {ln} ({cid}): invalid extra_dims_json")
            dims.append(d)
        if r["tensile_lbs"] or r["working_load_lbs"]:
            perf.append({"chain_id":cid,"tier":"Standard",
                "tensile_strength_lbs":r["tensile_lbs"],"tensile_strength_kn":r["tensile_kn"],
                "working_load_lbs":r["working_load_lbs"],"working_load_kn":r["working_load_kn"],
                "temp_min_c":r["temp_min_c"],"temp_max_c":r["temp_max_c"],
                "lubrication":r["lubrication"]})
        if r["provenance"] in ("unverified-legacy","derived"):
            flags.append({"chain_id":cid,"flag_type":"Spec Verification","severity":"Medium",
                "note":f"Provenance={r['provenance']} — verify specs against manufacturer catalog before publishing.",
                "resolved":False,"assigned_to":""})

    print(f"Rows: {len(df)} | chains: {len(nc)} | equivalents: {len(eq)} | dims: {len(dims)} | perf: {len(perf)} | flags: {len(flags)}")
    print(f"Warnings: {len(warnings)}")
    for w in warnings[:15]: print("  !", w)
    if errors:
        print(f"\nERRORS ({len(errors)}) — no files emitted:")
        for e in errors[:30]: print("  ", e)
        sys.exit(1)
    packs = [("01_normalized_chains",nc),("02_manufacturer_equivalents",eq),
             ("03_chain_dimensions",dims),("04_performance_data",perf),("09_review_flags",flags)]
    for name,data in packs:
        with open(f"{outdir}/import_{name}.json","w") as f: json.dump(data,f,indent=1)
    print(f"\nOK: {len(packs)} import packs written to {outdir}/ — import 01 first, via the staging pipeline.")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv)>2 else ".")
