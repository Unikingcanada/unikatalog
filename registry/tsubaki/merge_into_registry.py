#!/usr/bin/env python3
"""Mirror the 4 compiled Tsubaki packs into registry/families/*.json.
- 84 net-new records appended (DP-/HP-/LF- ids + 49 RF conveyor).
- 16 chain_number collisions SUPERSEDE existing: keep existing chain_id, richer
  (non-empty) Tsubaki field wins; source_refs unioned; specs/perf merged.
Run: python3 merge_into_registry.py
"""
import json, os, glob
HERE=os.path.dirname(os.path.abspath(__file__)); FAM=os.path.join(HERE,"..","families")
PKGS={"01_rf_conveyor":"Conveyor Roller Chains","01b_double_pitch":"Double Pitch Conveyor Chains",
      "01d_hollow_pin":"Hollow Pin Chains","01f_leaf":"Leaf Chains"}
SLUG={"Conveyor Roller Chains":"conveyor-roller-chains","Double Pitch Conveyor Chains":"double-pitch-conveyor-chains",
      "Hollow Pin Chains":"hollow-pin-chains","Leaf Chains":"leaf-chains"}

def load(p): return json.load(open(p))
def ne(v): return v not in (None,"",[],{})

def build_record(nc, dims, perf, eq):
    """Combine import packs into one self-contained registry record."""
    specs={}
    if dims:
        for k_src,k_dst in [("pitch_in","pitch_in"),("pitch_mm","pitch_mm"),
            ("roller_diameter_in","roller_dia_in"),("roller_diameter_mm","roller_dia_mm"),
            ("inner_width_in","inner_width_in"),("inner_width_mm","inner_width_mm"),
            ("pin_diameter_in","pin_dia_in"),("pin_diameter_mm","pin_dia_mm"),
            ("plate_height_in","plate_height_in"),("plate_height_mm","plate_height_mm"),
            ("weight_lbs_ft","weight_lbs_ft"),("weight_kg_m","weight_kg_m")]:
            if ne(dims.get(k_src)): specs[k_dst]=dims[k_src]
        if ne(dims.get("extra_dims")): specs.update(dims["extra_dims"])
    tiers=[]
    if perf:
        t={"tier":perf.get("tier","Standard")}
        for k in ("tensile_strength_lbs","tensile_strength_kn","working_load_lbs","working_load_kn",
                  "temp_min_c","temp_max_c","lubrication","source"):
            if ne(perf.get(k)): t[k]=perf[k]
        tiers=[t]
    refs=[{"manufacturer":e["brand"],"code":e["brand_part_number"],
           "confidence":e.get("confidence","High")} for e in eq if ne(e.get("brand_part_number"))]
    return {
        "chain_id":nc["chain_id"],"chain_family":nc["chain_family"],"chain_number":nc["chain_number"],
        "display_name":nc["display_name"],"standard":nc["standard"],
        "pitch_in":nc["pitch_in"],"pitch_mm":nc["pitch_mm"],"strands":nc.get("strands",1),
        "description":nc["description"],"application_tags":nc.get("application_tags",[]),
        "materials_available":nc.get("materials_available",[]),"options_upgrades":nc.get("options_upgrades",""),
        "image_url":nc.get("image_url",""),"drawing_url":nc.get("drawing_url",""),
        "status":nc.get("status","Active"),"needs_review":nc.get("needs_review",False),
        "uniking_notes":nc.get("uniking_notes",""),
        "specs":specs,"performance_tiers":tiers,"source_refs":refs,
        "sprocket_series":nc["chain_number"],"provenance":"catalog-verified","_origin":"tsubaki_pkg01",
    }

def supersede(existing, new):
    """Keep existing chain_id; new non-empty fields win; merge specs/refs/perf."""
    m=dict(existing); m["chain_id"]=existing["chain_id"]  # keep existing id
    for k,v in new.items():
        if k in ("chain_id",): continue
        if k=="specs":
            sp=dict(existing.get("specs",{})); sp.update({kk:vv for kk,vv in v.items() if ne(vv)}); m["specs"]=sp
        elif k=="source_refs":
            seen={(r.get("manufacturer"),r.get("code")) for r in existing.get("source_refs",[])}
            m["source_refs"]=existing.get("source_refs",[])+[r for r in v if (r.get("manufacturer"),r.get("code")) not in seen]
        elif k=="performance_tiers":
            m[k]=v if v else existing.get(k,[])
        elif ne(v): m[k]=v
    m["provenance"]="catalog-verified"
    note=existing.get("uniking_notes","")
    m["uniking_notes"]=(note+" | "+new.get("uniking_notes","")).strip(" |") if new.get("uniking_notes") else note
    m["_superseded_by"]="tsubaki_pkg01 (richer data merged; original chain_id kept)"
    return m

# index packs by chain_id
records={}
for name in PKGS:
    nc={c["chain_id"]:c for c in load(f"out/{name}/import_01_normalized_chains.json")}
    dims={d["chain_id"]:d for d in load(f"out/{name}/import_03_chain_dimensions.json")}
    perf={p["chain_id"]:p for p in load(f"out/{name}/import_04_performance_data.json")}
    eq={}
    for e in load(f"out/{name}/import_02_manufacturer_equivalents.json"): eq.setdefault(e["chain_id"],[]).append(e)
    records[name]=[build_record(nc[cid],dims.get(cid),perf.get(cid),eq.get(cid,[])) for cid in nc]

summary={"new":0,"updated":0,"by_family":{}}
for name,fam in PKGS.items():
    path=os.path.join(FAM,SLUG[fam]+".json"); data=load(path)
    by_num={str(c.get("chain_number","")).upper():i for i,c in enumerate(data["chains"])}
    new=upd=0
    for rec in records[name]:
        key=str(rec["chain_number"]).upper()
        if key in by_num:                       # collision -> supersede in place
            i=by_num[key]; data["chains"][i]=supersede(data["chains"][i],rec); upd+=1
        else:
            data["chains"].append(rec); new+=1
    data["chains"].sort(key=lambda c:c["chain_id"]); data["count"]=len(data["chains"])
    json.dump(data,open(path,"w"),indent=2); open(path,"a").write("\n")
    summary["new"]+=new; summary["updated"]+=upd
    summary["by_family"][fam]={"file":SLUG[fam]+".json","total_now":data["count"],"new":new,"updated":upd}
    print(f"{fam:32} total={data['count']:3}  (+{new} new, ~{upd} superseded)")
print(f"\nTOTAL: +{summary['new']} new, ~{summary['updated']} superseded")
json.dump(summary,open("MERGE_SUMMARY.json","w"),indent=2)
