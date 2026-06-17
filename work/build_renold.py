#!/usr/bin/env python3
import json, csv, re
HDR=["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_renold","pn_jeffrey","image_url","drawing_url","uniking_notes"]
def n(x): return "" if x in (None,"") else (str(int(x)) if isinstance(x,float) and x==int(x) else str(x))
def kg2lbsft(kg): return "" if kg in (None,"") else str(round(float(kg)/1.488,3))
def lbs_from_kn(kn): return str(round(float(kn)*224.809/10)*10)
SRC="Renold Conveyor Chain Catalogue (Renold/Jeffrey, renold.com)"
rows=[];seen=set()
def add(num,fam,pin_in,pmm,tens_lbs,tens_kn,wt_kg,desc,tags,roller_in=None,roller_mm=None,iw_in=None,iw_mm=None,plate_in=None,plate_mm=None,extra=None,nr="FALSE",note="",work_lbs=None,mats="alloy steel",jeff=""):
    cid="RENOLD-"+re.sub(r'[^A-Za-z0-9]+','-',num).strip('-').upper()
    if cid in seen: return
    seen.add(cid)
    rows.append({"chain_id":cid,"chain_family":fam,"chain_number":num,"display_name":f"Renold {num} {desc}",
      "standard":"","pitch_in":n(pin_in),"pitch_mm":n(pmm),"strands":"1","status":"Active",
      "provenance":"catalog-verified","needs_review":nr,"description":desc,"application_tags":tags,
      "materials_available":mats,"options_upgrades":"",
      "roller_dia_in":n(roller_in),"roller_dia_mm":n(roller_mm),"inner_width_in":n(iw_in),"inner_width_mm":n(iw_mm),
      "pin_dia_in":"","pin_dia_mm":"","plate_height_in":n(plate_in),"plate_height_mm":n(plate_mm),
      "weight_lbs_ft":kg2lbsft(wt_kg),"weight_kg_m":n(wt_kg),"extra_dims_json":(json.dumps(extra) if extra else ""),
      "tensile_lbs":n(tens_lbs),"tensile_kn":n(tens_kn),"working_load_lbs":n(work_lbs),"working_load_kn":"",
      "temp_min_c":"","temp_max_c":"","lubrication":"","perf_source":SRC,
      "pn_renold":num,"pn_jeffrey":jeff,"image_url":"","drawing_url":"","uniking_notes":note})

CONV="Conveyor Roller Chains";HP="Hollow Pin Chains";ENG="Engineered Class Chains";DR="Drag / Scraper Chains"
po="palm oil,conveyor,fruit,sterilizer,bulk handling"
# PALM OIL (p60). solid: (ref, pin, pmm, bl_lbf, bl_N, rollerin, rollermm, iwin, iwmm, pdin, pdmm, bearing_sqin, mass)
PO_SOLID=[
("S45161",4.0,101.6,18000,80000,1.875,47.6,0.75,19.0,1.50,38.1,0.94,6.43),
("S45241",6.0,152.4,18000,80000,1.875,47.6,0.75,19.0,1.50,38.1,0.94,5.24),
("S45162",4.0,101.6,32000,142000,2.625,66.7,1.00,25.4,2.00,50.8,1.75,14.22),
("S45242",6.0,152.4,32000,142000,2.625,66.7,1.00,25.4,2.00,50.8,1.75,11.18),
("S45243",6.0,152.4,50000,222000,3.50,88.9,1.50,38.1,2.40,61.0,2.88,24.15),
("E45161",4.0,101.6,26000,116000,1.875,47.6,0.75,19.0,1.50,38.1,0.94,6.43),
("E45241",6.0,152.4,26000,116000,1.875,47.6,0.75,19.0,1.50,38.1,0.94,5.24),
("E45162",4.0,101.6,50000,222000,2.625,66.7,1.00,25.4,2.00,50.8,1.75,14.22),
("E45242",6.0,152.4,50000,222000,2.625,66.7,1.00,25.4,2.00,50.8,1.75,11.18),
("X62161",4.0,101.6,30000,134000,1.875,47.6,0.75,19.0,1.50,38.1,0.94,6.43),
("X62241",6.0,152.4,30000,134000,1.875,47.6,0.75,19.0,1.50,38.1,0.94,5.24),
("X62162",4.0,101.6,60000,267000,2.625,66.7,1.00,25.4,2.00,50.8,1.75,14.22),
("X62242",6.0,152.4,60000,267000,2.625,66.7,1.00,25.4,2.00,50.8,1.75,11.18),
]
tier={"S":"Standard","E":"Premier","X":"Premier Extra"}
for ref,pi,pm,lbf,N,rdi,rdm,iwi,iwm,pdi,pdm,ba,mass in PO_SOLID:
    add(ref,CONV,pi,pm,lbf,round(N/1000,1),mass,f"Palm Oil Solid-Pin Conveyor Chain ({tier[ref[0]]})",po,
        roller_in=rdi,roller_mm=rdm,iw_in=iwi,iw_mm=iwm,plate_in=pdi,plate_mm=pdm,
        extra={"bearing_area_sq_in":ba,"bearing_pin":"solid"},note="Renold palm-oil conveyor chain, solid bearing pin.")
PO_HOLLOW=[
("S05161",4.0,101.6,15000,67000,1.875,47.6,0.75,19.0,1.50,38.1,0.52,13.2,0.94,5.91),
("S05162",4.0,101.6,26000,116000,2.625,66.7,1.00,25.4,2.00,50.8,0.79,20.1,1.75,12.74),
("S05242",6.0,152.4,26000,116000,2.625,66.7,1.00,25.4,2.00,50.8,0.79,20.1,1.75,10.91),
("S05243",6.0,152.4,44000,196000,3.500,88.9,1.50,38.1,2.40,61.0,0.91,23.1,2.88,22.18),
("E05161",4.0,101.6,17000,76000,1.875,47.6,0.75,19.0,1.50,38.1,0.52,13.2,0.94,5.91),
("E05162",4.0,101.6,36000,160000,2.625,66.7,1.00,25.4,2.00,50.8,0.79,20.1,1.75,12.74),
("E05242",6.0,152.4,36000,160000,2.625,66.7,1.00,25.4,2.00,50.8,0.79,20.1,1.75,10.91),
("X02242",6.0,152.4,50000,222000,2.625,66.7,1.00,25.4,2.00,50.8,0.79,20.1,1.75,10.91),
]
for ref,pi,pm,lbf,N,rdi,rdm,iwi,iwm,pdi,pdm,hbi,hbm,ba,mass in PO_HOLLOW:
    add(ref,HP,pi,pm,lbf,round(N/1000,1),mass,f"Palm Oil Hollow-Pin Conveyor Chain ({tier[ref[0]]})",po,
        roller_in=rdi,roller_mm=rdm,iw_in=iwi,iw_mm=iwm,plate_in=pdi,plate_mm=pdm,
        extra={"hollow_pin_bore_in":hbi,"hollow_pin_bore_mm":hbm,"bearing_area_sq_in":ba,"bearing_pin":"hollow"},
        note="Hollow bearing pin variant; breaking load runs below the solid-pin equivalent (hollow-pin physics) — do NOT backfill from solid base.")

# LUMBER 81X (p74): pitch in mm/inch from plate dims; given min breaking load kN(lbf), weight kg/m. (these dedupe to standard 81X)
LUM=[("81X","171306",107,24000,28.60,1.125,3.56),("81XH","171312",196,44000,32.15,1.266,5.22),("81XHH","171770",205,46000,32.15,1.266,6.86)]
for num,prod,kn,lbf,ph_mm,ph_in,mass in LUM:
    add("Renold "+num if num=="81X" else num,ENG,2.609,66.27,lbf,kn,mass,f"81X-Series Lumber Conveyor Chain ({num})","sawmill,lumber,conveyor,forestry",
        plate_in=ph_in,plate_mm=ph_mm,extra={"renold_product_no":prod,"plate_height_inner_mm":ph_mm},
        note=f"Renold product no {prod}. 81X family (2.609in pitch) — DEDUPE to existing standard 81X / lumber chain; merge pn_renold + flag spec differences.",
        nr="TRUE")
# CANE CARRIER (p67) primary specs: pitch 152.4mm, breaking load N. dims column-uncertain -> only roller/bush/pin confident
CANE=[("R.9060",312000,69.85,28.58,19.05,24.7),("R.9061",379000,69.85,28.58,19.05,25.3),("R.1796",445000,69.85,31.75,22.23,26.2),("R.9063",623000,76.20,31.75,23.83,27.5)]
for num,N,rd_mm,bush_mm,pin_mm,mass in CANE:
    add(num,ENG,6.0,152.4,lbs_from_kn(N/1000),round(N/1000,1),mass,"Sugar Cane Carrier Chain","sugar,cane carrier,conveyor",
        roller_mm=rd_mm,extra={"bush_dia_mm":bush_mm,"connecting_pin_dia_mm":pin_mm},
        note="Renold sugar cane carrier chain; some dimensional columns had OCR column-order uncertainty -> only confident dims recorded. Breaking load (N) catalog-verified; tensile_lbs derived per house rule.",nr="TRUE")
# APPLICATION GALLERY engineered chains (chain no, pitch_mm, breaking_kN). dims not given.
GAL=[
("171123",120.9,446,"Roller coaster ride bush chain (4.76in pitch)"),
("171360",103.2,446,"Roller coaster roller chain (4.063in pitch; replaces WH126)"),
("171649",103.2,446,"Roller coaster solid-pin chain (4.063in pitch; replaces WH124)"),
("176499",101.6,67,"Water ride bush chain (4in pitch, K3 attach, zinc plated)"),
("178388",101.6,134,"Water ride bush chain (4in pitch, K2 attach)"),
("179362",152.4,200,"Water ride bush chain (6in pitch, K2 attach)"),
("171749",152.4,550,"Water ride bush chain (6in pitch, solid pin, Hydro-Service)"),
("179840",152.4,400,"Water ride bush chain (6in pitch, K2 attach)"),
("176493",254.0,67,"Abattoir conveyor chain"),
("795034",152.4,160,"Car conveyor chain"),
("171044",280.0,96,"Overhead/packaging conveyor chain (outboard rollers)"),
("171260/90",177.8,285,"Cranked-link bakery chain"),
("588506",103.2,667,"Roller coaster cranked-link chain"),
("199232/90",190.0,712,"Pipe curing conveyor chain"),
("179701/90",304.8,400,"Spaced bucket elevator / steel-mill transfer chain"),
("171320/90",88.9,178,"Steriliser chain"),
]
for num,pm,kn,desc in GAL:
    add(num,ENG,round(pm/25.4,3),pm,lbs_from_kn(kn),kn,None,desc,"engineered,conveyor,special application",
        note="Renold special-engineered chain from application gallery; catalog gives chain no + pitch + breaking load only (no full dim table) -> dims blank.",nr="TRUE")

with open("drive/PKG-07b_renold_jeffrey.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=HDR);w.writeheader()
    for r in rows: w.writerow(r)
print("wrote",len(rows),"rows")
