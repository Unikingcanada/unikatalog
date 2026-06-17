#!/usr/bin/env python3
import csv, json, re
CORE=["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","image_url","drawing_url","uniking_notes"]
PN=["pn_tsubaki","pn_donghua","pn_canam","pn_macchain","pn_rexnord","pn_linkbelt","pn_renold","pn_jeffrey","pn_webster"]
# header: insert PN block right after perf_source
i=CORE.index("perf_source")+1
HDR=CORE[:i]+PN+CORE[i:]
ORDER=["PKG-01_tsubaki_rf_conveyor_chains.csv","PKG-01b_tsubaki_double_pitch_chains.csv","PKG-01d_tsubaki_hollow_pin_chains.csv","PKG-01f_leaf_chains_BL_part1.csv","PKG-02a_donghua_hp_dp_new_records.csv","PKG-02c_donghua_M_series.csv","PKG-02d_donghua_FV_series.csv","PKG-02e_donghua_S_agricultural_FIXED.csv","PKG-02f_donghua_LL_leaf.csv","PKG-02g_donghua_welded_steel.csv","PKG-02g-drag_donghua_drag_chains.csv","PKG-02-oilfield_donghua.csv","PKG-07_rexnord_linkbelt.csv","PKG-07b_renold_jeffrey.csv","PKG-07c_renold_jeffrey_steel_elevator.csv","PKG-08_webster.csv","PKG-09_macchain.csv","PKG-10_canam_chains.csv"]
SENS=["pitch_in","pitch_mm","roller_dia_in","inner_width_in","pin_dia_in","plate_height_in","weight_lbs_ft","tensile_lbs","tensile_kn","working_load_lbs"]
def brand_of(row):
    for p in PN:
        if row.get(p,"").strip(): return p.replace("pn_","")
    return "?"
def union_csv(a,b):
    s=[x.strip() for x in (a or "").split(",") if x.strip()]
    for x in [y.strip() for y in (b or "").split(",") if y.strip()]:
        if x not in s: s.append(x)
    return ",".join(s)
records={}   # chain_number -> merged row dict (master cols)
orderkeys=[]
collisions=[]
for f in ORDER:
    src="drive/"+f
    for row in csv.DictReader(open(src)):
        key=(row.get("chain_number") or "").strip()
        if not key: continue
        m={c:(row.get(c,"") or "").strip() for c in HDR}  # pull existing pn cols too
        if key not in records:
            records[key]=m; orderkeys.append(key); m["_brands"]=brand_of(row)
        else:
            ex=records[key]; rb=brand_of(row); conflicts=[]
            # union pn columns
            for p in PN:
                if m[p] and not ex[p]: ex[p]=m[p]
                elif m[p] and ex[p] and m[p]!=ex[p]: ex[p]=ex[p]  # keep; same-brand dup unlikely
            # spec fields
            for c in HDR:
                if c in PN or c in ("chain_id","chain_number","needs_review","uniking_notes","application_tags","materials_available"): continue
                if m[c] and not ex[c]:
                    ex[c]=m[c]
                elif m[c] and ex[c] and m[c]!=ex[c] and c in SENS:
                    conflicts.append(f"{c}: {ex[c]} ({ex.get('_brands')}) vs {m[c]} ({rb})")
            ex["application_tags"]=union_csv(ex["application_tags"],m["application_tags"])
            ex["materials_available"]=union_csv(ex["materials_available"],m["materials_available"])
            note_extra=f" | MERGED on chain_number with {rb}."
            if conflicts:
                ex["needs_review"]="TRUE"
                note_extra=f" | MERGE CONFLICT with {rb} — kept baseline, both values: "+"; ".join(conflicts)+"."
            ex["uniking_notes"]=(ex["uniking_notes"]+note_extra).strip()
            ex["_brands"]=ex.get("_brands","")+","+rb
            collisions.append((key,ex.get("_brands"),bool(conflicts)))
out=[]
for k in orderkeys:
    r=records[k]; r.pop("_brands",None); out.append(r)
with open("drive/PKG-MASTER_all_chains.csv","w",newline="") as fo:
    w=csv.DictWriter(fo,fieldnames=HDR); w.writeheader()
    for r in out: w.writerow(r)
print("master columns:",len(HDR))
print("total input rows:",sum(1 for f in ORDER for _ in csv.DictReader(open("drive/"+f))))
print("unique chain_numbers (master rows):",len(out))
print("collisions merged:",len(collisions),"| of which with spec conflict:",sum(1 for c in collisions if c[2]))
print("\nsample collisions:")
for k,b,c in collisions[:25]: print(f"  {k:14s} brands={b}  conflict={c}")
