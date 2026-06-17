#!/usr/bin/env python3
import json, csv, re
HDR=["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_rexnord","pn_linkbelt","image_url","drawing_url","uniking_notes"]
def num(x): return "" if x is None or x=="" else (str(int(x)) if isinstance(x,float) and x==int(x) else str(x))
def din(v): 
    try:return f"{round(float(v),3):.3f}".rstrip("0").rstrip(".")
    except:return ""
def dmm(v):
    try:return str(round(float(v)*25.4,2))
    except:return ""
def knl(x):
    try:return str(round(float(x)/224.809,1))
    except:return ""
def pmm(p):
    try:return str(round(float(p)*25.4,2))
    except:return ""
def pis(p):
    try:return f"{float(p):.3f}".rstrip("0").rstrip(".")
    except:return ""
SRC="Rexnord Conveyor, Elevator & Drive Chains Catalog (Rexnord/Link-Belt Engineered Steel)"
rows=[];seen=set()
def add(rex,fam,pitch,tens,work,wt,desc,tags,lb="",pin=None,plate=None,roller=None,extra=None,nr="FALSE",std="",note="",mats="alloy steel"):
    cid="REX-"+re.sub(r'[^A-Za-z0-9]+','-',rex).strip('-').upper()
    if cid in seen: return
    seen.add(cid)
    wtkg=round(float(wt)*1.488,3) if wt not in (None,"") else None
    rows.append({"chain_id":cid,"chain_family":fam,"chain_number":rex,"display_name":f"Rexnord {rex} {desc}",
      "standard":std,"pitch_in":pis(pitch),"pitch_mm":pmm(pitch),"strands":"1","status":"Active",
      "provenance":"catalog-verified","needs_review":nr,"description":desc,"application_tags":tags,
      "materials_available":mats,"options_upgrades":"",
      "roller_dia_in":din(roller),"roller_dia_mm":dmm(roller),"inner_width_in":"","inner_width_mm":"",
      "pin_dia_in":din(pin),"pin_dia_mm":dmm(pin),"plate_height_in":din(plate),"plate_height_mm":dmm(plate),
      "weight_lbs_ft":num(wt),"weight_kg_m":num(wtkg),"extra_dims_json":(json.dumps(extra) if extra else ""),
      "tensile_lbs":num(tens),"tensile_kn":(knl(tens) if tens not in (None,"") else ""),
      "working_load_lbs":num(work),"working_load_kn":(knl(work) if work not in (None,"") else ""),
      "temp_min_c":"","temp_max_c":"","lubrication":"","perf_source":SRC,
      "pn_rexnord":rex,"pn_linkbelt":lb,"image_url":"","drawing_url":"","uniking_notes":note})

ENG="Engineered Class Chains";WS="Welded Steel Chains";DR="Drag / Scraper Chains";PINF="Steel Pintle Chains";RIV="Drop Forged Rivetless Chains"
eng_tags="engineered class,conveyor,elevator,bulk handling";eng_note="Full dimensional row in Rexnord catalog; some dim columns had uncertain OCR attribution -> only primary specs (pitch/working load/ultimate/weight) recorded; dims omitted not guessed."

# ENGINEERED STEEL WITH ROLLERS (pp10-13): (rex, lb, pitch, rwl, minult_k, wt)
EWR=[
("RR362","RS625",1.654,1650,8,3.0),("RR432","RS627",1.654,2100,21,3.7),("81X","RS81X",2.609,2000,16,2.5),
("C1288","SS1088",2.609,2000,16,2.5),("1578","",2.609,2200,17,2.6),("RR778","RS886",2.609,2300,23,2.9),
("RR588","RS887",2.609,2500,17,3.8),("81XH","RS81XH",2.609,2500,28,4.1),("81XHH","RS81XHH",2.609,2500,28,4.6),
("270","SS2004",2.609,3500,40,6.9),("7774","",2.609,3500,40,6.4),
("SR183","RS3013",3.000,2100,22,4.0),("A4539","",3.075,4650,38,6.8),("1539","RS1539",3.075,4650,24,6.8),("7539","",3.110,4650,40,9.1),
("RR1120","RS4013",4.000,2100,13,3.4),("SR194","RS4216",4.000,2350,15,5.3),("SR188","",4.000,2400,13,4.2),
("4","RS4019",4.000,2500,21,4.2),("2188","RS2188",4.000,4200,23,7.0),("531","RS4328",4.000,4500,28,9.7),
("ER3433","",4.000,5300,41,9.0),("A2868","",4.000,7200,57,12.1),
("3420","RS1113",4.040,4300,23,7.6),("C2848","",4.040,6600,48,11.0),("2858","",4.083,7200,57,13.0),("3285","",4.500,10500,91,21.0),
("SR196","RS6018",6.000,2600,18,5.0),("1604","",6.000,2800,20,5.3),("2126","RS1116",6.000,3400,21,5.0),
("2190","RS2190",6.000,3400,21,7.0),("1670","",6.000,4100,23,6.3),("SR1114","RS1114",6.000,4200,23,6.3),
("2180","",6.000,4500,35,8.7),("S951","",6.000,4500,37,10.7),("2183","RS951",6.000,4600,24,10.7),
("1036","",6.000,4600,24,4.8),("1617","",6.000,4800,43,11.0),("SR3130","",6.000,5200,45,10.0),("6","RS6238",6.000,5600,45,11.0),
("RR542","",6.000,6000,28,5.7),("BR2111","RS944",6.000,5900,67,9.6),("C2124","",6.000,6000,63,11.8),("A2124","RS996",6.000,6000,63,11.8),
("RS1131","RS1131",6.000,6000,45,12.5),("FX2184","RO2184",6.000,6500,58,12.3),("FX9184","",6.000,8300,100,15.2),
("A2178","",6.000,7000,56,15.3),("A2198","RS960",6.000,7650,101,18.2),("5208","",6.000,8950,54,10.5),
("C9856","",6.000,14000,97,22.1),("B9856","",6.000,14000,97,22.1),
("A2800","",8.000,9800,94,62.2),
("1039","",9.000,4650,24,4.3),("ER911","RS911",9.000,4650,33,8.5),("ER922","SS927",9.000,7200,34,12.0),
("FR922","SS922",9.000,7200,34,12.5),("R2342","",9.000,9000,54,9.2),("R2405","",9.000,9000,88,9.7),
("ER933","",9.000,9200,53,15.6),("FR933","SS933",9.000,9200,48,16.5),("R4009","RS4851",9.000,9200,67,14.7),
("X4004","RS4852",9.000,12700,65,18.5),("4065","RS4065",9.000,18900,148,36.2),
("E1211","RS1211",12.000,4650,31,7.0),("ER1222","SS1227",12.000,7200,34,10.0),("FR1222","SS1222",12.000,7200,34,10.5),
("R1251","",12.000,9000,56,9.8),("ER1233","",12.000,9200,61,13.1),("FR1233","SS1233",12.000,9200,62,14.0),
("RR2397","",12.000,9200,60,9.5),("4011","",12.000,9200,63,12.6),("ER1244","",12.000,12300,85,20.5),
("FR1244","",12.000,12300,63,21.5),("R1706","",12.000,14000,79,13.9),("R2614","",12.000,17500,135,24.0),("R4010","",12.000,23500,185,39.2),
("ER1822","",18.000,7200,34,8.5),("FR1822","",18.000,7200,34,9.0),("F1833","",18.000,9200,63,11.5),("FR1844","",18.000,12300,89,17.0),
]
for rex,lb,p,rwl,mu,wt in EWR:
    add(rex,ENG,p,mu*1000,rwl,wt,"Engineered Steel Roller Chain",eng_tags,lb=lb,note=eng_note)

# ENGINEERED STEEL WITHOUT ROLLERS (p14) incl 800/900 elevator: (rex,lb,pitch,rwl,minult_k,wt)
EWO=[
("S188","SBS188",2.609,2740,23,3.8),("ER131","SBS131",3.075,4450,36,7.4),("1536","SBS1972",3.075,4900,51,9.2),
("1535","SBS2162",3.075,5300,50,9.4),("ER102B","SBS102B",4.000,6300,36,6.9),("ER1025","SBS102.5",4.040,7800,48,9.4),
("ER111","SBS111",4.760,8850,48,10.2),("SR830","",6.000,6000,50,7.5),("ER110","SBS110",6.000,6300,36,6.3),
("ER833","",6.000,8900,48,9.3),("SR844","SBS844",6.000,9000,52,10.4),("6826","",6.000,9600,68,12.0),
("ER856","SBX856",6.000,14000,82,16.5),("ER956","",6.000,14000,97,16.6),("ER857","SBX2857",6.000,14000,97,21.0),
("ER958","",6.000,16300,97,21.0),("ER859","SBX2859",6.000,22000,155,34.0),
("ER150","SBS150",6.050,15000,85,16.6),("SX175","",6.050,18500,114,24.5),("ER864","SBX2864",7.000,22000,155,33.0),
("ER984","",7.000,24000,155,33.0),("SX886","",7.000,24000,255,42.0),
]
for rex,lb,p,rwl,mu,wt in EWO:
    add(rex,ENG,p,mu*1000,rwl,wt,"Engineered Steel Chain (rollerless)",eng_tags+",elevator",lb=lb,
        note=eng_note+(" ER800/900 = elevator chain series." if rex.startswith("ER8") or rex.startswith("ER9") else ""))

# WELDED STEEL Narrow (p38): Pitch,A,E,T,F,G,D,I,MinUlt,RWL,Wt  -> pin=G, plate=F, roller=D, tens=MinUlt, work=RWL
WHN=[
("WH78",2.609,"1.13","0.50","2.00",24000,3500,4),("WH82",3.075,"1.25","0.56","2.25",29500,4400,6),
("WHX124",4.000,"1.50","0.75","2.81",50500,7350,9),("WHX124HD",4.063,"2.00","0.88","3.00",80000,9150,14),
("WHX111",4.760,"1.50","0.75","3.38",50500,8850,8),("WHX106",6.000,"1.50","0.75","2.81",50500,7350,7),
("WH110",6.000,"1.50","0.75","3.00",50500,7900,7),("WHX132",6.050,"2.00","1.00","4.38",85000,15000,14),
("WHX150",6.050,"2.50","1.00","4.38",90000,15000,16),("WHX155",6.050,"2.50","1.13","4.38",102000,17500,19),
("WHX157",6.050,"2.50","1.13","4.63",117000,18200,20),("WHX2855",6.050,"2.50","1.25","4.63",140000,20250,20),
("WHX3855",6.050,"3.00","1.25","4.63",175000,20250,22),("WHX159",6.125,"3.00","1.25","4.63",204000,20250,27),
("WHX4855",12.000,"2.50","1.25","4.63",119000,20250,15),
]
for rex,p,F,G,D,mu,rwl,wt in WHN:
    add(rex,WS,p,mu,rwl,wt,"Welded Steel Mill Chain (narrow series)","sawmill,mill,welded steel,conveyor",
        pin=G,plate=F,roller=D,mats="carbon steel,heat-treated")
# WELDED STEEL Wide WDH (p39): Pitch,A,E,T,F,G,D(barrel-len),MinUlt,RWL,Wt
WDH=[
("WDH104",6.000,"1.50","0.75",55000,10000,9),("WDH110",6.000,"1.50","0.75",55000,10000,12),
("WDH113",6.000,"1.50","0.88",57000,11700,18),("WDH120",6.000,"2.00","0.88",79000,15000,20),
("WDH112",8.000,"1.50","0.75",55000,10000,10),("WDH116",8.000,"1.75","0.75",59000,11500,13),
("WDH118",8.000,"2.00","0.88",79000,15000,21),("WDH480",8.000,"2.00","0.88",79000,15000,18),
("WDH580",8.000,"2.00","1.00",108000,20500,18),("WDH680",8.000,"2.00","1.00",108000,20500,21),
("WDH2210",6.136,"1.50","0.75",55000,10000,11.5),("WDH2316",8.126,"1.75","0.75",55000,11500,13),("WDH2380",8.161,"2.00","0.88",79000,15000,18),
]
for rex,p,F,G,mu,rwl,wt in WDH:
    add(rex,DR,p,mu,rwl,wt,"Wide Welded Steel Mill Drag Chain","sawmill,drag conveyor,welded steel",
        pin=G,plate=F,mats="carbon steel,heat-treated")
# WELDED STEEL Heavy Duty Drag (p41): pin=G,barrel=D; tens=MinUlt,work=RWL
WHD=[("WHX5157",6.050,"1.13",117000,18200),("WHX6067",9.000,"1.25",195000,24300),("WHX5121",9.000,"1.25",205000,27600),("WHX6121",9.000,"1.25",205000,27600)]
for rex,p,G,mu,rwl in WHD:
    add(rex,DR,p,mu,rwl,None,"Heavy Duty Welded Steel Drag Chain","sawmill,drag conveyor,heavy duty,welded steel",pin=G,mats="carbon steel,heat-treated",
        note="Barrel length available as a range (8-30 in, 2-in increments) per catalog.")

# DROP FORGED (p57): Standard 468/698/998/9118, X348/X458/X678, S-series. pin=G, tens=ult, work=RWL, wt
DF=[
("468",4.031,"0.75",5800,88000,7.8),("698",6.031,"1.13",25000,175000,12.5),("998",9.031,"1.13",25000,175000,10.3),("9118",9.031,"1.38",35000,1250000,16.3),
("X348",3.015,"0.50",2000,40000,1.9),("X458",4.031,"0.63",4000,57000,3.1),("X678",6.031,"0.88",7100,125000,6.5),
("S348",3.019,"0.50",2000,None,2.4),("S458",4.031,"0.63",4000,None,3.5),("S468",4.031,"0.75",6700,None,7.9),
("S678",6.031,"0.88",7700,None,8.6),("S698",6.031,"1.13",10800,None,11.7),("S998",9.031,"1.13",10800,None,12.1),
]
for rex,p,G,rwl,ult,wt in DF:
    nrf="TRUE" if ult is None else "FALSE"
    note="" if ult is not None else "S-series: catalog lists working load but no ultimate strength -> tensile blank, needs_review."
    add(rex,RIV,p,ult,rwl,wt,"Drop Forged Rivetless Chain","drop forged,rivetless,bulk handling,en-masse",pin=G,mats="drop-forged steel",nr=nrf,
        note=("9118 ultimate 1,250,000 lbs per catalog (verify; printed '1250,000')." if rex=="9118" else note))

# CAST PINTLE (p48): Pitch,A,D,E,F(pin),G,H(barrel),RWL,Wt,MaxRPM. No ultimate -> working only.
CP=[
("945",1.630,"0.31","0.63",830,1.5),("955",1.630,"0.38","0.63",1060,1.9),("977",2.308,"0.44","0.81",1650,2.0),
("988",2.609,"0.44","0.88",2150,2.9),("C9103",3.075,"0.75","1.25",4250,5.7),("C720",6.000,"0.69","1.38",3220,4.2),
("720S",6.000,"0.75","1.44",4250,5.1),("A730",6.000,"0.75","1.50",4500,6.0),("CS720S",6.000,"0.75","1.44",4250,5.4),("CS730",6.000,"0.75","1.50",4500,6.4),
]
for rex,p,F,H,rwl,wt in CP:
    add(rex,PINF,p,None,rwl,wt,"Cast Pintle Chain","pintle,conveyor,cast",pin=F,roller=H,mats="cast steel",
        note="Cast chain: catalog gives rated working load, no ultimate -> tensile blank. Not for elevator service.")
# CAST COMBINATION (p51): Pitch,A,D,E,T,F,G(pin),H(barrel),RWL,Wt,MaxRPM
CC=[
("RexC55",1.630,"0.38","0.63",1100,2.0),("RexC77",2.308,"0.44","0.72",1400,2.2),("RexC188",2.609,"0.50","0.88",2400,3.6),
("RexC131",3.075,"0.63","1.22",3800,6.5),("RexC102B",4.000,"0.63","0.97",5000,6.7),("RexC1025",4.040,"0.75","1.38",6700,9.2),
("RexC111",4.760,"0.75","1.44",7500,9.6),("RexC133",6.000,"0.88","1.75",5000,8.8),("RexC110",6.000,"0.63","1.25",5000,6.0),("RexC132",6.050,"1.00","1.72",10500,14.0),
]
for rex,p,G,H,rwl,wt in CC:
    disp=rex.replace("Rex","")
    add(rex,DR,p,None,rwl,wt,f"Cast Combination Chain ({disp})","combination,conveyor,cast,bulk handling",pin=G,roller=H,mats="cast steel,malleable",
        note=f"Rexnord/Link-Belt cast combination chain {disp}. Cast: rated working load only (no ultimate). chain_number prefixed 'Rex' to avoid collision with welded combination C-numbers.")

with open("drive/PKG-07_rexnord_linkbelt.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=HDR);w.writeheader()
    for r in rows: w.writerow(r)
print("wrote",len(rows),"rows")
