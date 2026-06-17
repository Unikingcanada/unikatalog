#!/usr/bin/env python3
import json, csv, re
HDR=["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_renold","pn_jeffrey","image_url","drawing_url","uniking_notes"]
def n(x): return "" if x in (None,"") else (str(int(x)) if isinstance(x,float) and x==int(x) else str(x))
def mm(v): 
    try: return str(round(float(v)*25.4,2))
    except: return ""
def knl(x):
    try: return str(round(float(x)/224.809,1))
    except: return ""
def wkg(lbsft):
    try: return str(round(float(lbsft)*1.488,3))
    except: return ""
SRC="Renold Jeffrey Cement/Elevator + Forestry/Wood/Paper Chain Catalogues (renold.com)"
rows=[];seen=set()
def add(num,fam,pin_in,tens,work,wt,desc,tags,iw=None,roller=None,pin=None,plate=None,extra=None,nr="FALSE",note="",tmax=None):
    cid="RENOLD-"+re.sub(r'[^A-Za-z0-9]+','-',num).strip('-').upper()
    if cid in seen: return
    seen.add(cid)
    rows.append({"chain_id":cid,"chain_family":fam,"chain_number":num,"display_name":f"Renold Jeffrey {num} {desc}",
      "standard":"","pitch_in":n(pin_in),"pitch_mm":mm(pin_in),"strands":"1","status":"Active",
      "provenance":"catalog-verified","needs_review":nr,"description":desc,"application_tags":tags,
      "materials_available":"alloy steel,heat-treated","options_upgrades":"",
      "roller_dia_in":n(roller),"roller_dia_mm":mm(roller),"inner_width_in":n(iw),"inner_width_mm":mm(iw),
      "pin_dia_in":n(pin),"pin_dia_mm":mm(pin),"plate_height_in":n(plate),"plate_height_mm":mm(plate),
      "weight_lbs_ft":n(wt),"weight_kg_m":wkg(wt),"extra_dims_json":(json.dumps(extra) if extra else ""),
      "tensile_lbs":n(tens),"tensile_kn":(knl(tens) if tens not in (None,"") else ""),
      "working_load_lbs":n(work),"working_load_kn":(knl(work) if work not in (None,"") else ""),
      "temp_min_c":"","temp_max_c":(n(tmax) if tmax else ""),"lubrication":"","perf_source":SRC,
      "pn_renold":num,"pn_jeffrey":"","image_url":"","drawing_url":"","uniking_notes":note})

BE="Bucket Elevator Chains";DR="Drag / Scraper Chains";WS="Welded Steel Chains"
be_tags="bucket elevator,cement,bulk handling";dr_tags="drag,scraper,cement,welded steel";mill_tags="sawmill,mill,welded steel,forestry,conveyor"
be_note="Renold Jeffrey bucket elevator chain; middle dimensional columns had OCR column-order uncertainty -> only pitch/inside-width/loads recorded as confident; full dims in catalog. needs_review."
# BUCKET ELEVATOR (File1): (num, pitch, inside_width, RWL, ULT)
BUCKET=[
("6956-PB",6.00,3.00,16000,144500),("6867-R",6.00,3.00,14000,170000),("6866-R",6.00,2.50,17400,167000),
("6869-R",6.00,3.72,22000,267000),("6969-R",6.00,3.72,30000,275000),("6864-R",7.00,3.72,22000,267000),
("6684",7.00,3.75,24000,270000),("6875-R",7.00,3.75,30000,275000),("6874",7.00,4.00,38000,420000),
("3252-PR",9.00,2.63,12650,116000),("4035-PB",9.00,3.16,16400,131700),("4065-RJ",9.00,3.06,19000,215000),
("4037-PB",9.00,3.25,27000,253000),("6859-R",9.00,2.50,14000,130000),("6881-AR",9.00,3.00,24500,260000),("6889-PB",9.00,2.75,26000,260000),
]
for num,p,iw,rwl,ult in BUCKET:
    add(num,BE,p,ult,rwl,None,"Bucket / Super-Capacity Elevator Chain (sealed joint)",be_tags,iw=iw,nr="TRUE",
        note=be_note+(" 4065-RJ = Renold Jeffrey 4065 (suffix RJ to avoid collision with Rexnord 4065)." if num=="4065-RJ" else ""))
# HARD FACE WELDED DRAG (File1): (num, wt, pitch, inside_width, pin_dia, ULT, RWL, tmax)
HFD=[
("WS5157-H",23,6.05,3.000,1.125,180000,18200),("WS6067-HHF",27,9.00,3.625,1.250,230000,24300),
("WS6267-HHF",27,9.00,3.630,1.375,210000,26700),("WS5121-HHF",35,9.00,3.630,1.250,275000,27600),
("WS5221-HHF",36,9.00,3.630,1.375,305000,30300),("WS6121-HHF",36,9.00,3.630,1.250,275000,27600),("WS6221-HHF",36,9.00,3.630,1.375,305000,30300),
]
for num,wt,p,iw,pin,ult,rwl in HFD:
    add(num,DR,p,ult,rwl,wt,"Hard-Face Welded Steel Drag Chain",dr_tags+",high temperature",iw=iw,pin=pin,nr="FALSE",
        note="Hard-face (H/HHF) welded drag chain; runs in material temps up to 1000F.",tmax=538)
# WELDED STEEL MILL (File2 ch.13 order: ult_base, rwl_base, ult_P, rwl_P): (base, pitch, A_iw, B_barrel, C_plate, EF_pin, ult_b, rwl_b, ult_p, rwl_p, wt)
MILL=[
("WS78",2.609,1.500,0.875,1.125,0.500,24000,3000,30000,3500,3.90),
("WS82",3.075,1.750,1.219,1.250,0.563,26000,3750,35000,4400,5.50),
("WS82H",3.075,1.750,1.219,1.250,0.563,26000,4600,35000,5400,7.10),
("WS784",4.000,1.500,0.875,1.125,0.500,24000,3000,30000,3500,3.30),
("WS124",4.000,2.060,1.438,1.500,0.750,46000,6300,60000,7350,8.50),
("WS124HD",4.063,2.000,1.625,2.000,0.875,84000,7850,90000,9150,14.40),
("WS111",4.760,2.625,1.438,1.500,0.750,46000,7550,58600,8850,8.40),
("WS106",6.000,2.063,1.375,1.500,0.750,37000,6300,56500,7400,6.70),
("WS110",6.000,2.250,1.250,1.500,0.750,46000,6750,60000,7850,6.60),
("WS132",6.050,3.375,1.750,2.000,1.000,84000,13100,100000,15300,13.50),
("WS150",6.050,3.375,1.750,2.500,1.000,84000,13100,100000,14500,14.50),
]
for base,p,iw,bar,pl,pin,ub,rb,up,rp,wt in MILL:
    add(base,WS,p,ub,rb,wt,"Engineering Class Welded Steel Mill Chain",mill_tags,iw=iw,roller=bar,pin=pin,plate=pl,
        note="Base chain. Catalog also lists 'P' variant ("+base+"P) with higher ratings (see "+base+"P record).")
    add(base+"P",WS,p,up,rp,wt,"Engineering Class Welded Steel Mill Chain (P variant)",mill_tags,iw=iw,roller=bar,pin=pin,plate=pl,
        note="'P' variant of "+base+" (higher ultimate/working). Base/P load pairing per ch.13 ordering; ch.21 printed same numbers in different order (extraction column-jumble) -> verify.",nr="TRUE")
# Singles (no P pair)
for num,p,iw,bar,pl,pin,ult,rwl,wt in [
 ("WS855PB",6.050,3.313,2.500,2.500,1.125,150000,17000,20.50),
 ("WS855HDP",6.050,3.375,2.500,2.500,1.125,175000,20000,20.50),
 ("WS859PB",6.125,3.375,3.000,3.000,1.250,230000,20250,23.50)]:
    add(num,WS,p,ult,rwl,wt,"Engineering Class Welded Steel Mill Chain (heavy)",mill_tags,iw=iw,roller=bar,pin=pin,plate=pl)
# WELDED STEEL DRAG (File2): (base, pitch, A_iw, B_barrel, C_plate, EF_pin, ult_b, rwl_b, ult_p, rwl_p, wt)
WDRAG=[
("WSD102",5.000,7.000,1.500,1.500,0.750,42000,7000,60000,10000,12.00),
("WSD104",6.000,4.625,1.500,1.500,0.750,46000,7650,60000,10000,8.60),
("WSD110",6.000,9.625,1.500,1.500,0.750,46000,7650,60000,10000,13.50),
("WSD120",6.000,9.250,2.000,2.000,0.875,70000,11500,90000,15000,22.00),
("WSD112",8.000,9.625,1.500,1.500,0.750,46000,7650,60000,10000,11.40),
("WSD116",8.000,13.375,1.750,1.750,0.750,56000,9300,69000,11500,16.00),
("WSD122",8.000,9.250,2.000,2.000,0.875,70000,11500,90000,15000,18.00),
("WSD480",8.000,11.750,2.000,2.000,0.875,84000,14000,90000,15000,20.00),
]
for base,p,iw,bar,pl,pin,ub,rb,up,rp,wt in WDRAG:
    add(base,DR,p,ub,rb,wt,"Engineering Class Welded Steel Drag Chain",dr_tags+",sawmill,forestry",iw=iw,roller=bar,pin=pin,plate=pl,
        note="Base chain. Catalog also lists 'P' variant ("+base+"P) with higher ratings.")
    add(base+"P",DR,p,up,rp,wt,"Engineering Class Welded Steel Drag Chain (P variant)",dr_tags+",sawmill,forestry",iw=iw,roller=bar,pin=pin,plate=pl,
        note="'P' variant of "+base+"; base/P load pairing per ch.13 ordering -> verify.",nr="TRUE")
add("WD480XHDP",DR,8.000,122000,20300,21.00,"Extra Heavy Duty Welded Steel Drag Chain (P)",dr_tags+",sawmill,forestry",iw=11.750,roller=2.000,pin=1.000,plate=2.000)

with open("drive/PKG-07c_renold_jeffrey_steel_elevator.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=HDR);w.writeheader()
    for r in rows: w.writerow(r)
print("wrote",len(rows),"rows")
