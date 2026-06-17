#!/usr/bin/env python3
import json, csv

HDR = ["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_donghua","image_url","drawing_url","uniking_notes"]

def mm2in(mm):
    if mm is None: return ""
    v = round(mm/25.4, 3)
    s = f"{v:.3f}".rstrip("0").rstrip(".")
    return s

def tens_lbs(kn):
    if kn is None: return ""
    return str(round(kn*224.809/10)*10)

def num(v):  # clean numeric -> string, strip trailing .0
    if v is None: return ""
    if isinstance(v,float) and v==int(v): return str(int(v))
    return str(v)

d = json.load(open("oilfield_raw.json"))
rows = []
for r in d["rows"]:
    ansi, dh, pmm, pin_frac, d1, b1, d2, Lc, h2, T, Pt, Q, q = r
    strands = 1
    if "-" in ansi:
        try: strands = int(ansi.split("-")[1].replace("H",""))
        except: strands = 1
    extra = {}
    if Lc is not None: extra["pin_length_mm_max"] = Lc
    if T is not None: extra["plate_thickness_mm_max"] = T
    if Pt is not None: extra["transverse_pitch_mm"] = Pt
    is_heavy = "H" in ansi
    standard = "ANSI/ASME B29.1" + (" heavy series" if is_heavy else "")
    note = ("Donghua oil-field roller chain (S-series), catalog pp.31-32. Tensile is Donghua oil-field rating; "
            "on dedup with standard ANSI %s keep BOTH tensile values and set needs_review (never overwrite). "
            "Add oil-field application tags + pn_donghua to existing record if present." % ansi)
    weight_lbs_ft = "" if q is None else f"{q/1.488:.3f}".rstrip("0").rstrip(".")
    row = {
        "chain_id": "DH-OILFIELD-"+ansi,
        "chain_family": "Performance Roller Chains",
        "chain_number": ansi,
        "display_name": f"Donghua {dh} Oil Field Roller Chain (ANSI {ansi})",
        "standard": standard,
        "pitch_in": mm2in(pmm),
        "pitch_mm": num(pmm),
        "strands": str(strands),
        "status": "Active",
        "provenance": "catalog-verified",
        "needs_review": "FALSE",
        "description": f"Donghua oil field drive chain, ANSI {ansi}, {strands}-strand. Heavy-duty roller chain for petroleum drilling / drawworks (API 7F context).",
        "application_tags": "oil field,petroleum,drilling,drawworks,power transmission",
        "materials_available": "",
        "options_upgrades": "",
        "roller_dia_in": mm2in(d1), "roller_dia_mm": num(d1),
        "inner_width_in": mm2in(b1), "inner_width_mm": num(b1),
        "pin_dia_in": mm2in(d2), "pin_dia_mm": num(d2),
        "plate_height_in": mm2in(h2), "plate_height_mm": num(h2),
        "weight_lbs_ft": weight_lbs_ft, "weight_kg_m": num(q),
        "extra_dims_json": json.dumps(extra) if extra else "",
        "tensile_lbs": tens_lbs(Q), "tensile_kn": num(Q),
        "working_load_lbs": "", "working_load_kn": "",
        "temp_min_c": "", "temp_max_c": "",
        "lubrication": "",
        "perf_source": "Donghua General Catalog, Oil Field Chains pp.31-32",
        "pn_donghua": dh,
        "image_url": "", "drawing_url": "",
        "uniking_notes": note,
    }
    rows.append(row)

with open("drive/PKG-02-oilfield_donghua.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=HDR)
    w.writeheader()
    for r in rows: w.writerow(r)
print("wrote", len(rows), "rows ->", "drive/PKG-02-oilfield_donghua.csv")
# sanity print a few computed values
for r in rows[:3]:
    print(r["chain_number"], "| pin", r["pitch_in"], r["pitch_mm"], "| tens", r["tensile_lbs"], r["tensile_kn"], "| wt", r["weight_lbs_ft"], r["weight_kg_m"])
