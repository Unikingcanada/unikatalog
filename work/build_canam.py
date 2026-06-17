#!/usr/bin/env python3
import json, csv, re

HDR = ["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_canam","image_url","drawing_url","uniking_notes"]

def frac(s):
    if s is None: return None
    s=str(s).strip().replace('"','')
    if s in ("","-","—"): return None
    try:
        t=0.0
        for p in s.split():
            if '/' in p:
                n,d=p.split('/'); t+=float(n)/float(d)
            else: t+=float(p)
        return t
    except: return None
def din(v): 
    if v is None: return ""
    return f"{round(v,3):.3f}".rstrip("0").rstrip(".")
def dmm(v):
    if v is None: return ""
    return str(round(v*25.4,2))
def knl(lbs):
    if lbs is None: return ""
    return str(round(lbs/224.809,1))
def pin(p):  # pitch decimal -> str
    return f"{p:.3f}".rstrip("0").rstrip(".")

rows=[]; seen=set()
SRC="Can-Am Chains Products Catalog (English/Imperial)"
def add(num,fam,pitch,ult,work,wt,extra,tags,mats,desc,pin_in=None,plate_in=None,roller_in=None,note="",nr="FALSE",standard=""):
    cid="CANAM-"+re.sub(r'[^A-Za-z0-9]+','-',num).strip('-').upper()
    if cid in seen: return
    seen.add(cid)
    wtkg=round(wt*1.488,3) if wt is not None else None
    pis = pin(pitch) if pitch is not None else ""
    pms = str(round(pitch*25.4,2)) if pitch is not None else ""
    rows.append({"chain_id":cid,"chain_family":fam,"chain_number":num,
      "display_name":f"Can-Am {num} {desc}","standard":standard,
      "pitch_in":pis,"pitch_mm":pms,"strands":"1","status":"Active",
      "provenance":"catalog-verified","needs_review":nr,"description":desc,
      "application_tags":tags,"materials_available":mats,"options_upgrades":"",
      "roller_dia_in":din(roller_in),"roller_dia_mm":dmm(roller_in),
      "inner_width_in":"","inner_width_mm":"",
      "pin_dia_in":din(pin_in),"pin_dia_mm":dmm(pin_in),
      "plate_height_in":din(plate_in),"plate_height_mm":dmm(plate_in),
      "weight_lbs_ft":(str(wt) if wt is not None else ""),"weight_kg_m":(str(wtkg) if wtkg is not None else ""),
      "extra_dims_json":(json.dumps(extra) if extra else ""),
      "tensile_lbs":(str(ult) if ult is not None else ""),"tensile_kn":knl(ult),
      "working_load_lbs":(str(work) if work is not None else ""),"working_load_kn":knl(work),
      "temp_min_c":"","temp_max_c":"","lubrication":"","perf_source":SRC,"pn_canam":num,
      "image_url":"","drawing_url":"","uniking_notes":note})

WS="Welded Steel Chains"; DR="Drag / Scraper Chains"; PINF="Steel Pintle Chains"
BE="Bucket Elevator Chains"; ENG="Engineered Class Chains"; RIV="Drop Forged Rivetless Chains"
mt="sawmill,forestry,lumber,mill,welded steel,conveyor"; dt="sawmill,refuse,hog fuel,drag conveyor,welded steel"
mm_="carbon steel,heat-treated rivets"

def ABDF(A,B,Dd,F,**kw):
    d={"overall_width_A_in":A,"length_bearing_B_in":B,"sidebar_thk_D_in":Dd,"tooth_face_F_in":F}
    d.update(kw); return {k:v for k,v in d.items() if v}

# MILL offset WR/WH: (num,pitch,ult,work,wt, A,B,C-rivet,D,E-sbh,F,G-barrel)
mill=[
("WR-78",2.609,27000,4500,4.3,"3","2","1/2","1/4","1 1/4","1","0.840"),
("WH-78",2.609,33000,5500,4.3,"3","2","1/2","1/4","1 1/4","1","0.840"),
("WR-78-4",4.000,27000,4500,3.5,"3","2","1/2","1/4","1 1/4","1","0.840"),
("WR-82",3.075,30000,5000,4.7,"3 3/8","2 1/4","9/16","1/4","1 1/4","1 1/8","1"),
("WH-82",3.075,36000,6000,4.7,"3 3/8","2 1/4","9/16","1/4","1 1/4","1 1/8","1"),
("WR-124",4.000,50400,8200,7.8,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WH-124",4.000,57000,9500,7.8,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WR-111",4.760,50400,9500,8.6,"4 13/16","3 3/8","3/4","3/8","1 3/4","1 3/4","1 1/4"),
("WH-111",4.760,60000,12000,8.6,"4 13/16","3 3/8","3/4","3/8","1 3/4","1 3/4","1 1/4"),
("WR-106",6.000,50400,8200,6.2,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WH-106",6.000,60000,12000,6.2,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WR-132",6.050,85500,14100,14.1,"6 3/8","4 13/32","1","1/2","2","2 3/4","1 3/4"),
("WH-132",6.050,122000,20300,14.1,"6 3/8","4 13/32","1","1/2","2","2 3/4","1 3/4"),
("WR-150",6.050,120000,19000,16.3,"6 1/2","4 13/32","1","1/2","2 1/2","2 3/4","1 3/4"),
("WH-150",6.050,122000,20300,16.3,"6 1/2","4 13/32","1","1/2","2 1/2","2 3/4","1 3/4"),
("WR-155",6.050,148000,22000,19.0,"6 13/32","4 7/16","1 1/8","9/16","2 1/2","2 3/4","1 3/4"),
("WH-155",6.050,175000,29000,19.0,"6 13/32","4 7/16","1 1/8","9/16","2 1/2","2 3/4","1 3/4"),
("WR-157",6.050,148000,22000,20.0,"6 3/4","4 5/8","1 1/8","5/8","2 1/2","2 3/4","1 3/4"),
("WH-157",6.050,175000,29000,20.0,"6 3/4","4 5/8","1 1/8","5/8","2 1/2","2 3/4","1 3/4"),
("WR-159",6.125,185000,28000,26.0,"6 3/4","4 5/8","1 1/4","5/8","3","2 3/4","1.9"),
("WH-159",6.125,210000,32000,26.0,"6 3/4","4 5/8","1 1/4","5/8","3","2 3/4","1.9"),
("WR-200",6.125,185000,28000,22.1,"6 3/4","4 5/8","1 1/4","5/8","2 1/2","2 3/4","1.9"),
("WH-200",6.125,190000,32000,22.1,"6 3/4","4 5/8","1 1/4","5/8","2 1/2","2 3/4","1.9"),
]
for n,p,u,w,wt,A,B,C,Dd,E,F,G in mill:
    add(n,WS,p,u,w,wt,ABDF(A,B,Dd,F),mt,mm_,"Offset Sidebar Welded Steel Mill Chain",
        pin_in=frac(C),plate_in=frac(E),roller_in=frac(G))

# MILL straight WRC/WHC
millc=[
("WRC78",2.609,27000,4500,4.3,"3","2","1/2","1/4","1 1/4","1","0.840"),
("WHC78",2.609,27000,4500,4.3,"3","2","1/2","1/4","1 1/4","1","0.840"),
("WRC82",3.075,30000,5000,3.5,"3 3/8","2 1/4","9/16","1/4","1 1/4","1","0.840"),
("WHC82",3.075,30000,5000,3.5,"3 3/8","2 1/4","9/16","1/4","1 1/4","1","0.840"),
("WRC131",3.075,50400,8400,6.8,"3 9/16","2","3/4","3/8","1 1/2","1","1 1/4"),
("WHC131",3.075,50400,8400,6.8,"3 9/16","2","3/4","3/8","1 1/2","1","1 1/4"),
("WRC124",4.000,50400,8400,7.8,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WHC124",4.000,50400,8400,7.8,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WRC111",4.760,50400,8400,8.6,"4 13/16","3 3/8","3/4","3/8","1 3/4","1 3/4","1 1/4"),
("WHC111",4.760,50400,8400,8.6,"4 13/16","3 3/8","3/4","3/8","1 3/4","1 3/4","1 1/4"),
("WRC110",6.000,50400,8400,7.2,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WHC110",6.000,50400,8400,7.2,"4 1/4","2 3/4","3/4","3/8","1 1/2","1 1/2","1 1/4"),
("WRC132",6.050,85500,14100,14.1,"6 1/2","4 13/32","1","1/2","2","2 3/4","1 3/4"),
("WHC132",6.050,85500,14100,14.1,"6 1/2","4 13/32","1","1/2","2","2 3/4","1 3/4"),
("WRC150",6.050,120000,19000,16.3,"6 1/2","4 13/32","1","1/2","2 1/2","2 3/4","1 3/4"),
("WHC150",6.050,120000,19000,16.3,"6 1/2","4 13/32","1","1/2","2 1/2","2 3/4","1 3/4"),
("WRC157",6.050,125000,22000,21.0,"6 3/4","4 5/8","1 1/8","5/8","2 1/2","2 3/4","1 3/4"),
("WHC157",6.050,125000,22000,21.0,"6 3/4","4 5/8","1 1/8","5/8","2 1/2","2 3/4","1 3/4"),
]
for n,p,u,w,wt,A,B,C,Dd,E,F,G in millc:
    add(n,WS,p,u,w,wt,ABDF(A,B,Dd,F),mt,mm_,"Straight Sidebar Welded Steel Mill Chain (C-Class)",
        pin_in=frac(C),plate_in=frac(E),roller_in=frac(G),note="WRC131/WHC131 fits in 4-inch channel." if "131" in n else "")

# MILL XHD
millx=[
("WR-78XHD",2.636,36000,6000,6.3,"3 3/8","2","9/16","3/8","1 1/4","1","1"),
("WH-78XHD",2.636,36000,6000,6.3,"3 3/8","2","9/16","3/8","1 1/4","1","1"),
("WR-82XHD",3.075,50400,8400,8.5,"3 3/4","2 3/8","3/4","3/8","1 1/2","1 1/8","1 1/4"),
("WH-82XHD",3.075,57000,9500,8.5,"3 3/4","2 3/8","3/4","3/8","1 1/2","1 1/8","1 1/4"),
("WR-124XHD",4.063,85000,14200,14.6,"4 7/8","3","1","1/2","2","1 1/2","1 5/8"),
("WH-124XHD",4.063,122000,20400,14.6,"4 7/8","3","1","1/2","2","1 1/2","1 5/8"),
("WR-106XHD",6.050,85000,14200,11.8,"4 7/8","3","1","1/2","2","1 1/2","1 3/4"),
("WH-106XHD",6.050,122000,20400,11.8,"4 7/8","3","1","1/2","2","1 1/2","1 3/4"),
("WR-132XHD",6.050,120000,20000,15.3,"6 3/4","4 21/32","1","5/8","2","2 3/4","1 3/4"),
("WH-132XHD",6.050,122000,20400,15.3,"6 3/4","4 21/32","1","5/8","2","2 3/4","1 3/4"),
("WRC82XHD",3.075,50400,8400,8.3,"3 3/4","2 3/8","3/4","3/8","1 1/2","1 1/8","1 1/4"),
("WHC82XHD",3.075,57000,9500,8.3,"3 3/4","2 3/8","3/4","3/8","1 1/2","1 1/8","1 1/4"),
("WRC124XHD",4.063,85000,14200,14.6,"4 7/8","3","1","1/2","2","1 1/2","1 5/8"),
("WHC124XHD",4.063,122000,20400,14.6,"4 7/8","3","1","1/2","2","1 1/2","1 5/8"),
("WRC110XHD",6.050,85000,14200,11.8,"4 7/8","3","1","1/2","2","1 1/2","1 3/4"),
("WHC110XHD",6.050,122000,20400,11.8,"4 7/8","3","1","1/2","2","1 1/2","1 3/4"),
("WRC132XHD",6.050,120000,20000,15.3,"6 3/4","4 21/32","1","5/8","2","2 3/4","1 3/4"),
("WHC132XHD",6.050,122000,20400,15.3,"6 3/4","4 21/32","1","5/8","2","2 3/4","1 3/4"),
]
for n,p,u,w,wt,A,B,C,Dd,E,F,G in millx:
    add(n,WS,p,u,w,wt,ABDF(A,B,Dd,F),mt,mm_,"Extra Heavy Duty Welded Steel Mill Chain (XHD)",
        pin_in=frac(C),plate_in=frac(E),roller_in=frac(G),note="78XHD fits in 4-inch channel." if "78XHD" in n else "")

# OSB IBR net-new numbers only (144/166 not in base mill table)
for n,p,u,w,wt,A,B,C,Dd,E,F,G in [
 ("WH-144 IBR",4.000,85000,14200,12.5,"4 5/16","2 3/4","1","3/8","1 3/4","1 1/2","1 5/8"),
 ("WH-166 IBR",6.000,85000,14200,11.7,"4 1/4","2 3/4","1","3/8","1 3/4","1 1/2","1 5/8")]:
    add(n,WS,p,u,w,wt,ABDF(A,B,Dd,F,heat_treat="induction-hardened barrels & rivets (IBR)"),mt,
        "carbon steel,induction-hardened","OSB Welded Steel Mill Chain (IBR)",
        pin_in=frac(C),plate_in=frac(E),roller_in=frac(G))

# DRAG WD (A,B,C-rivet,D,E-sbh,F-max face; no barrel)
for n,p,u,w,wt,A,B,C,Dd,E,F in [
 ("WD-102",5.000,51000,10200,12.0,"9 1/4","7 3/4","3/4","3/8","1 1/2","6 3/8"),
 ("WD-104",6.000,51000,10200,8.1,"6 3/4","5 3/8","3/4","3/8","1 1/2","4 1/8"),
 ("WD-110",6.000,51000,10200,12.0,"11 3/4","10 1/4","3/4","3/8","1 1/2","9"),
 ("WD-112",8.000,51000,10200,9.5,"11 3/4","10 1/4","3/4","3/8","1 1/2","9"),
 ("WD-116",8.000,51000,10200,13.8,"15 1/2","14 1/8","3/4","3/8","1 3/4","13"),
 ("WD-118",8.000,70000,14000,18.7,"16 5/8","14 7/8","7/8","1/2","2","13 1/4"),
 ("WD-120",6.000,70000,14000,18.4,"12","10 1/4","7/8","1/2","2","8 3/4"),
 ("WD-122",8.000,70000,14000,15.3,"12","10 1/4","7/8","1/2","2","8 3/4"),
 ("WD-480",8.000,70000,14000,17.1,"14 1/2","12 3/4","7/8","1/2","2","11")]:
    add(n,DR,p,u,w,wt,ABDF(A,B,Dd,F),dt,mm_,"Welded Steel Drag Chain",
        pin_in=frac(C),plate_in=frac(E),note="Pin also available in 1-inch dia.")
for n,p,u,w,wt,A,B,C,Dd,E,F in [
 ("WD-120XHD",6.000,122000,24400,22.5,"12 3/4","10 1/2","1","5/8","2","8 3/4"),
 ("WD-118XHD",8.000,122000,24400,22.5,"17 3/8","15 1/8","1","5/8","2","11"),
 ("WD-122XHD",8.000,122000,24400,19.5,"12 3/4","10 1/2","1","5/8","2","8 3/4"),
 ("WD-480XHD",8.000,122000,24400,21.0,"15 1/4","13","1","5/8","2","11")]:
    add(n,DR,p,u,w,wt,ABDF(A,B,Dd,F),dt,mm_,"Extra Heavy Duty Welded Steel Drag Chain (XHD)",
        pin_in=frac(C),plate_in=frac(E))
# HOG SH/WH
for n,p,u,w,wt,A,B,C,Dd,E,F,kind in [
 ("WDRS118-SH",8.000,85500,17100,22.0,"16 5/8","14 7/8","1","1/2","2","13 1/4","Super Hog"),
 ("WDRS118-XHDSH",8.000,122000,24400,24.5,"17 3/8","14 7/8","1","5/8","2","13 1/4","Super Hog"),
 ("WDRS120-SH",6.000,85500,17100,22.0,"12","10 1/4","1","1/2","2","8 3/4","Super Hog"),
 ("WDRS120-XHDSH",6.000,122000,24400,24.0,"12 3/4","10 1/4","1","5/8","2","8 3/4","Super Hog"),
 ("WDRS122-SH",8.000,85500,17100,17.5,"12","10 1/4","1","1/2","2","8 3/4","Super Hog"),
 ("WDRS122-XHDSH",8.000,122000,24400,20.0,"12 3/4","10 1/4","1","5/8","2","8 3/4","Super Hog"),
 ("WDRS480-SH",8.000,85500,17100,21.5,"14 1/2","12 3/4","1","1/2","2","11","Super Hog"),
 ("WDRS480-XHDSH",8.000,122000,24400,23.0,"15 1/4","13","1","5/8","2","11","Super Hog"),
 ("WDRS118-WH",8.000,85500,17100,25.5,"16 5/8","14 7/8","1","1/2","2","13 1/4","Whole Hog"),
 ("WDRS118-XHDWH",8.000,122000,24400,28.0,"17 3/8","14 7/8","1","5/8","2","13 1/4","Whole Hog"),
 ("WDRS120-WH",6.000,85500,17100,24.0,"12","10 1/4","1","1/2","2","8 3/4","Whole Hog"),
 ("WDRS120-XHDWH",6.000,122000,24400,27.0,"12 3/4","10 1/4","1","5/8","2","8 3/4","Whole Hog"),
 ("WDRS122-WH",8.000,85500,17100,20.0,"12","10 1/4","1","1/2","2","8 3/4","Whole Hog"),
 ("WDRS122-XHDWH",8.000,122000,24400,22.0,"12 3/4","10 1/4","1","5/8","2","8 3/4","Whole Hog"),
 ("WDRS480-WH",8.000,85500,17100,22.5,"14 1/2","12 3/4","1","1/2","2","11","Whole Hog"),
 ("WDRS480-XHDWH",8.000,122000,24400,25.0,"15 1/4","13","1","5/8","2","11","Whole Hog")]:
    add(n,DR,p,u,w,wt,ABDF(A,B,Dd,F),dt,mm_,kind+" Drag Chain",pin_in=frac(C),plate_in=frac(E))

# MALLEABLE H + combination C
add("H-78",DR,2.609,20200,None,4.2,ABDF(None,None,None,"1",overall_width_A_in="3 3/8"),"sawmill,mill,malleable,transfer","malleable iron,carbon steel sidebars","Malleable Mill Chain",pin_in=frac("1/2"),plate_in=frac("1 1/8"))
add("H-82",DR,3.075,22000,None,5.5,ABDF(None,None,None,"1 1/8",overall_width_A_in="4 1/16"),"sawmill,mill,malleable,transfer","malleable iron,carbon steel sidebars","Malleable Mill Chain",pin_in=frac("9/16"),plate_in=frac("1 1/4"))
for n,p,u,wt,A,B,C,Dd,E,F,G in [
 ("C-55",1.630,9000,2.0,"1 13/16","1 7/32","3/8","7/32","23/32","3/4","0.72"),
 ("C-77",2.308,11000,2.3,"2 3/32","1 1/4","7/16","3/16","7/8","11/16","0.72"),
 ("C-188",2.609,14000,3.5,"2 5/8","1 9/16","1/2","1/4","1 1/8","7/8","7/8"),
 ("C-131",3.075,24000,6.7,"3 5/8","2","5/8","3/8","1 1/2","1 1/8","1 7/32"),
 ("C-102B",4.000,24000,6.4,"4 9/16","2 25/32","5/8","3/8","1 1/2","1 1/2","1")]:
    add(n,DR,p,u,None,wt,ABDF(A,B,Dd,F),"sawmill,mill,combination,malleable","malleable iron centre,carbon steel sidebars",
        "Steel/Malleable Combination Chain",pin_in=frac(C),plate_in=frac(E),roller_in=frac(G),
        note="Available riveted or pin & cotter; SS pins available.")

# POWER TRANSMISSION / TRIMMER (offset+straight). capture pitch/ult/work/wt; dims in extra
for n,style,p,u,w,wt in [
 ("SO-578","offset",2.609,19000,2200,2.7),("MO-88","offset",2.609,20000,2400,3.8),
 ("LXS-882","offset",2.609,29000,2800,3.9),("MOH-578","offset",2.609,19000,2200,2.7),
 ("MS-88","straight",2.609,26000,2500,3.8),("81-X","straight",2.609,22000,2200,2.6),
 ("81-XH","straight",2.609,41800,5000,3.9),("81-XHS","straight",2.609,41800,5000,4.2),
 ("SS-188","offset",2.609,26000,2500,3.8)]:
    add(n,ENG,p,u,w,wt,{"style":style},"sawmill,lumber conveyor,trimmer,power transmission","carbon/alloy steel (see catalog material codes)",
        "Power Transmission / Trimmer Chain",note="Sidebar/pin/bushing/roller material codes per catalog (C/CH/CC/AH/AC).")

# ENGINEERED CLASS SB/US
for n,p,wt,u,pind,Dd,E,G,F in [
 ("SB2512",3.067,13.2,110000,"0.750","3/8","2 1/4","1.62","1.50"),
 ("SB3011",3.067,13.2,110000,"0.750","3/8","2 1/4","1.62","1.50"),
 ("SB1242",4.063,15.6,140000,"0.875","1/2","2 1/4","1.75","1.90"),
 ("SB1245",4.073,18.6,170000,"0.938","9/16","2 3/8","1 25/32","1.90"),
 ("SB1254",4.060,18.6,170000,"0.938","1/2","2 1/4","1.78","1.20"),
 ("US-3075",3.075,9.6,75000,"0.650","0.38","1 3/4","1 1/4","1.50"),
 ("US-4522",4.500,25.4,220000,"1.100","0.56","3","2 1/4","2.06")]:
    add(n,ENG,p,u,None,wt,ABDF(None,None,Dd,F),"engineered class,conveyor,heavy duty","alloy steel",
        "Engineered Class Welded/Bushed Chain",pin_in=frac(pind),plate_in=frac(E),roller_in=frac(G))

# BUCKET ELEVATOR (HB bushed)
for n,p,u,w,wt,A,B_bush,C_pin,E,Dd,G,H,T,nrr,nt in [
 ("SB850",6.000,200000,25000,23.5,"5 3/4","2 7/8","3 5/16","2 1/4","2","1 5/16","3","5/8","FALSE",""),
 ("856",6.000,100000,14000,16.5,"6 1/8","2 7/8","3 1/4","3","1 3/4","1","2 1/2","1/2","FALSE",""),
 ("857",6.000,130000,14000,21.0,"6 1/8","2 7/8","3 1/4","3","1 3/4","1","3 1/4","1/2","FALSE","Outer plain sidebars 63.5mm high."),
 ("859",6.000,200000,21800,34.0,"7 3/8","3 9/16","3 13/16","3 3/4","2 3/8","1 1/4","4","5/8","FALSE","Outer plain sidebars 76.2mm high.")]:
    add(n,BE,p,u,w,wt,{"overall_width_A_in":A,"bushing_B_in":B_bush,"pin_C_in":C_pin,"overall_height_H_in":H,"sidebar_thk_T_in":T},
        "bucket elevator,cement,bulk handling","alloy steel (ACH/AIH/CHT per catalog)","HB Bushed Bucket Elevator Chain",
        pin_in=frac(G),plate_in=frac(E),note=nt)

# FORMED STEEL PINTLE (min adv tensile)
for sz,wt,mintens,p,pind,insC,H,T,B in [
 ("662",1.05,8500,1.664,"0.281","29/32","0.720","0.125","1 5/8"),
 ("667H",1.17,9500,2.313,"0.312","1","0.875","0.125","1 47/64"),
 ("667X",1.86,21000,2.250,"0.437","1 1/16","0.937","0.170","1 61/64"),
 ("667XC",2.10,18000,2.250,"0.437","1 1/16","0.937","0.170","1 61/64"),
 ("667K",2.44,20000,2.250,"0.437","1 5/64","1.062","0.200","2 1/8"),
 ("667KC",2.56,24000,2.250,"0.437","1 5/64","1.062","0.200","2 1/8"),
 ("667XH",2.80,28000,2.250,"0.469","1 5/64","1.062","0.224","2 5/16"),
 ("88K",2.30,20000,2.609,"0.437","1 5/64","1.062","0.200","2 1/8")]:
    add(sz,PINF,frac(p),mintens,None,wt,{"inside_width_C_in":insC,"overall_height_H_in":H,"thickness_T_in":T,"overall_width_B_in":B},
        "sorter,pintle,conveyor,sawmill","formed steel","Formed Steel Pintle Chain",pin_in=frac(pind),
        note="tensile_lbs = MINIMUM advertised tensile (catalog). 667-series/88K are industry-standard pintle numbers; dedupe to existing if present.")

# J-BAR SORTER 3939 + CAM900
for n,wt,u,p,extra,nt in [
 ("3939",1.55,24000,8.000,{"alias":"81X-8","P_in":"1.930","E_in":"1.125"},"Also referred to as 81X-8."),
 ("3939-4",1.55,24000,8.000,{"alias":"81X-8","P_in":"1.930"},""),
 ("3939-H",2.40,37000,8.000,{"P_in":"2.300"},"Heavy variant.")]:
    add(n,ENG,p,u,None,wt,extra,"sawmill,sorter,J-bar,lumber","carbon steel","J-Bar Sorter Chain",note=nt)
for n,p,u,A,C_pin,F_sbh,G_inside in [
 ("CAM 900STR",9.0,12000,"1 7/8","0.59","1 1/2","0.78"),
 ("CAM 900HSTRHVY",9.0,15000,"2 1/8","0.64","1 1/2","0.69")]:
    add(n,ENG,p,u,None,None,{"overall_width_A_in":A,"inside_width_G_in":G_inside},"sawmill,sorter,lumber","carbon steel",
        "CAM 900 Sorter Chain",pin_in=frac(C_pin),plate_in=frac(F_sbh))

# RIVETLESS X-style (dims only, no tensile -> needs_review)
for n,p,Bmin,Dpin,Fmax,Lmax,T,X,Xa in [
 ("X-348",3.0,"0.531","0.500","1.078","1.750","0.400","0.750","0.500"),
 ("X-458",4.0,"0.660","0.630","1.430","2.250","0.470","1.000","0.630"),
 ("468",4.0,"0.840","0.750","1.880","3.340","0.630","1.630","1.130"),
 ("X-658",6.0,"0.660","0.630","1.410","2.250","0.480","1.020","0.630"),
 ("X-678",6.0,"0.970","0.870","2.000","3.130","0.750","1.280","0.840"),
 ("698",6.0,"1.190","1.120","2.690","3.750","0.850","1.560","1.000"),
 ("998",9.0,"1.190","1.120","2.690","3.750","0.880","1.560","1.000"),
 ("9118",9.0,"1.450","1.380","3.130","4.880","1.250","1.940","1.310"),
 ("9148",9.0,"1.910","1.750","3.780","5.850","1.380","2.470","1.630")]:
    add(n,RIV,p,None,None,None,{"B_min_in":Bmin,"F_max_height_in":Fmax,"L_max_width_in":Lmax,"sidebar_thk_T_in":T,"centre_link_X_in":X,"centre_link_Xa_in":Xa},
        "drop forged,rivetless,engineered class,bulk handling","drop-forged steel","Rivetless (X-Style) Drop-Forged Chain",
        pin_in=frac(Dpin),nr="TRUE",note="Catalog table gives dimensions only; no tensile published in Can-Am catalog -> tensile blank, needs_review.")

# 142 / CDM SYSTEMS
for n,u,w,wt,A,B,C,Dd,E in [
 ("102 HVY",38000,6900,0.99,"1.375","1.260","0.550","0.354","0.709"),
 ("142 STD",73000,13000,2.45,"1.970","1.650","0.750","0.470","0.980"),
 ("142 HVY",99000,18000,3.74,"1.970","2.440","1.140","0.630","0.980"),
 ("260 STD",150000,27270,14.0,"2.950","2.760","1.180","0.790","1.260")]:
    # pitch from A? 142 series pitch ~ but catalog gives A as a dim, not pitch. Use approximate from CDM: 142=50mm? -> but not stated as pitch clearly. Leave pitch from known: 102/142 pitch unclear -> skip pitch ambiguity: set pitch using A is WRONG. Per catalog these are CDM 'series' not ANSI; pitch not in the strength table. We'll mark pitch unknown -> but compiler needs pitch? No, pitch can be blank.
    rows_before=len(rows)
    add(n,DR,None,u,w,wt,{"A_in":A,"B_in":B,"C_in":C,"D_in":Dd,"E_in":E,"note":"dims A-E per CDM table; pitch not published in strength table; pitch blank pending verification"},
        "drag conveyor,bulk handling,CDM,en-masse","alloy steel","142/CDM Systems Drag Chain",nr="TRUE",
        note="CDM Systems engineered drag chain. Pitch not published in catalog strength table (pitch left blank; verify pitch). 5.5:1 safety ratio.")

with open("drive/PKG-10_canam_chains.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=HDR); w.writeheader()
    for r in rows: w.writerow(r)
print("wrote",len(rows),"rows")
