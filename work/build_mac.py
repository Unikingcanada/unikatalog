#!/usr/bin/env python3
import json, csv, re
HDR=["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_macchain","image_url","drawing_url","uniking_notes"]
UNI={'¼':'1/4','½':'1/2','¾':'3/4','⅜':'3/8','⅝':'5/8','⅞':'7/8','⅛':'1/8','⅓':'1/3','⅔':'2/3','⅕':'1/5','⅖':'2/5','⅗':'3/5','⅘':'4/5','⅙':'1/6','⅚':'5/6','⅖':'2/5'}
def norm(s):
    if s is None: return None
    s=str(s).replace('⁄','/').replace('”','').replace('"','').strip()
    for k,v in UNI.items(): s=s.replace(k,' '+v)
    return re.sub(r'\s+',' ',s).strip()
def frac(s):
    s=norm(s)
    if not s or s in ('-','—'): return None
    try:
        t=0.0
        for p in s.split():
            if '/' in p:
                n,d=p.split('/'); t+=float(n)/float(d)
            else: t+=float(p)
        return t
    except: return None
def din(v): return "" if v is None else f"{round(v,3):.3f}".rstrip("0").rstrip(".")
def dmm(v): return "" if v is None else str(round(v*25.4,2))
def knl(x): return "" if x is None else str(round(x/224.809,1))
def pin(p): return "" if p is None else f"{p:.3f}".rstrip("0").rstrip(".")
def num(x): 
    if x is None: return ""
    return str(int(x)) if isinstance(x,float) and x==int(x) else str(x)

rows=[]; seen=set()
SRC="MAC Chain 2019 Product Catalog (macchain.com)"
def add(numn,fam,pitch,t1,t2,wt,sbh,rivet,barrel,extra,tags,mats,desc,work=None,nr="FALSE",note="",standard=""):
    cid="MAC-"+re.sub(r'[^A-Za-z0-9]+','-',numn).strip('-').upper()
    if cid in seen: return
    seen.add(cid)
    p=frac(pitch); ph=frac(sbh); pn=frac(rivet); rl=frac(barrel)
    wtv=frac(wt); wtkg=round(wtv*1.488,3) if wtv is not None else None
    t1v=t1; 
    nt=note
    if t2 is not None:
        nt=(f"MAC catalog lists two ultimate strengths for this number: {num(t1)} lbs and {num(t2)} lbs "
            f"(heat-treated WH vs standard). tensile_lbs uses the base value; verify WR/WH column assignment. "+note).strip()
    extra2={k:v for k,v in (extra or {}).items() if v}
    rows.append({"chain_id":cid,"chain_family":fam,"chain_number":numn,
      "display_name":f"MAC {numn} {desc}","standard":standard,
      "pitch_in":(pin(p) if p else ""),"pitch_mm":(str(round(p*25.4,2)) if p else ""),
      "strands":"1","status":"Active","provenance":"catalog-verified","needs_review":nr,
      "description":desc,"application_tags":tags,"materials_available":mats,"options_upgrades":"",
      "roller_dia_in":din(rl),"roller_dia_mm":dmm(rl),"inner_width_in":"","inner_width_mm":"",
      "pin_dia_in":din(pn),"pin_dia_mm":dmm(pn),"plate_height_in":din(ph),"plate_height_mm":dmm(ph),
      "weight_lbs_ft":num(wtv),"weight_kg_m":(num(wtkg)),
      "extra_dims_json":(json.dumps(extra2) if extra2 else ""),
      "tensile_lbs":num(t1v),"tensile_kn":(knl(t1v) if t1v is not None else ""),
      "working_load_lbs":num(work),"working_load_kn":(knl(work) if work is not None else ""),
      "temp_min_c":"","temp_max_c":"","lubrication":"","perf_source":SRC,"pn_macchain":numn,
      "image_url":"","drawing_url":"","uniking_notes":nt})

WS="Welded Steel Chains";DR="Drag / Scraper Chains";PINF="Steel Pintle Chains";ENG="Engineered Class Chains"
SPC="Specialty / Custom Chains";DP="Double Pitch Conveyor Chains";AG="Agricultural Conveyor Chains"
mt="sawmill,forestry,lumber,mill,welded steel,conveyor";dt="sawmill,refuse,hog fuel,drag conveyor,welded steel";mm_="carbon steel,heat-treated"
def E(ow=None,lob=None,sbt=None,mst=None,**k):
    d={"overall_width_in":ow,"length_bearing_in":lob,"sidebar_thk_in":sbt,"max_sprocket_thk_in":mst};d.update(k)
    return {x:y for x,y in d.items() if y}

# OFFSET welded (num,pitch,t1,t2,sbh,sbt,rivet,ow,lob,mst,barrel,wt)
OFF=[
("WS78",2.609,29800,34000,"1 1/4","1/4","1/2","2 7/16","1 5/8","3/4","0.84","3.9"),
("WR78",2.609,29800,34000,"1 1/4","1/4","1/2","3","2","1","0.84","4.1"),
("WR78XHD",2.640,32700,38500,"1 1/4","3/8","9/16","3 9/32","2","1","1.05","6.3"),
("WR78-4",4.000,29800,34000,"1 1/4","1/4","1/2","3","2","1","0.84","3.4"),
("WR82",3.075,32780,39000,"1 1/4","1/4","9/16","3 5/16","2 1/4","1 3/8","1.05","4.7"),
("WR82XHD",3.075,50400,60000,"1 1/2","3/8","3/4","3 13/16","2 3/8","1 1/8","1.25","8.4"),
("WR124",4.000,50400,60000,"1 1/2","3/8","3/4","4 1/4","2 13/16","1 1/2","1.25","8"),
("WR124XHD",4.050,85500,121500,"2 1/2",None,"1","4 7/8","3","1 1/2","1.66","14.5"),
("WR111",4.760,50400,60000,"1 3/4","3/8","3/4","4 13/16","3 3/8","2 1/4","1.25","8.6"),
("WR106",6.000,50400,60000,"1 1/2","3/8","3/4","4 1/4","2 13/16","1 1/2","1.25","6.5"),
("WR106XHD",6.050,85500,121500,"2 1/2",None,"1","4 7/8","3","1 1/2","1.66","11.5"),
("WR132",6.050,85500,121500,"2 1/2",None,"1","6 1/4","4 7/16","3 1/8","1.66","13.5"),
("WR132XHD",6.050,118500,142000,"2 5/8",None,"1","6 3/4","4 11/16","3 1/8","1.66","15.9"),
("WR150",6.050,120000,144000,"2 1/2","1/2","1","6 1/4","4 7/16","2 3/4","1.66","15.5"),
("WR150XHD",6.050,122000,148000,"2 1/2","5/8","1","6 3/4","4 11/16","2 3/4","1.66","18"),
("WR157",6.050,148000,163500,"2 1/2","5/8","1 1/8","6 3/4","4 5/8","2 3/4","1.75","20"),
]
for n,p,t1,t2,sbh,sbt,rv,ow,lob,mst,bar,wt in OFF:
    add(n,WS,p,t1,t2,wt,sbh,rv,bar,E(ow,lob,sbt,mst),mt,mm_,"Offset Sidebar Welded Steel Mill Chain",nr="TRUE")
# STRAIGHT welded
STR=[
("WRC131",3.075,50400,57000,"1 1/2","3/8","3/4","3 9/16","2 1/8","1 1/8","1.25","8.4"),
("WRC124",4.000,50400,57000,"1 1/2","3/8","3/4","4 1/4","2 13/16","1 1/2","1.25","8"),
("WRC124XHD",4.050,85500,122700,"2 1/2",None,"1","4 7/8","3","1 1/2","1.66","14.5"),
("WRC111",4.760,50400,57000,"1 3/4","3/8","3/4","4 13/16","3 3/8","2","1.25","8.6"),
("WRC110",6.000,50400,57000,"1 1/2","3/8","3/4","4 1/4","2 13/16","1 1/2","1.25","6.4"),
("WRC110XHD",6.050,85500,122000,"2 1/2",None,"1","4 7/8","3","1 1/2","1.66","11.5"),
("WRC132",6.050,85500,122000,"2 1/2",None,"1","6 1/4","4 7/16","3 1/8","1.66","13"),
("WRC132XHD",6.050,118500,142000,"2 5/8",None,"1","6 3/4","4 11/16","3 1/8","1.66","15.9"),
("WRC150",6.050,120000,144000,"2 1/2","1/2","1","6 1/4","4 7/16","3 1/8","1.66","15.5"),
("WRC150XHD",6.050,122500,148000,"2 1/2","5/8","1","6 3/4","4 11/16","3 1/8","1.66","18"),
]
for n,p,t1,t2,sbh,sbt,rv,ow,lob,mst,bar,wt in STR:
    add(n,WS,p,t1,t2,wt,sbh,rv,bar,E(ow,lob,sbt,mst),mt,mm_,"Straight Sidebar Welded Steel Mill Chain (C-type)",nr="TRUE")
# DRAG (no barrel)
DRAGT=[
("WD102",5.000,51000,61000,"1 1/2","3/8","3/4","9 1/4","7 3/4","6 3/8","12"),
("WD104",6.000,51000,61000,"1 1/2","3/8","3/4","6 3/4","5 3/8","4 1/8","8.6"),
("WD110",6.000,51000,61000,"1 1/2","3/8","3/4","11 3/4","10 1/4","9","12"),
("WD112",8.000,51000,61000,"1 1/2","3/8","3/4","11 3/4","10 1/4","9","10"),
("WD116",8.000,55000,69000,"1 3/4","3/8","3/4","15 1/2","14 1/8","13","12.9"),
("WD118",8.000,85000,102000,"2 1/2",None,"1","16 5/8","14 7/8","13 1/4","18"),
("WD118XHD",8.000,122000,146000,"2 5/8",None,"1","17 3/8","15 1/8","13 1/4","21"),
("WD120",6.000,85000,102000,"2 1/2",None,"1","12","10 1/4","8 3/4","18"),
("WD120XHD",6.000,122000,146000,"2 5/8",None,"1","12 3/4","10 1/2","8 3/4","21"),
("WD122",8.000,85000,102000,"2 1/2",None,"1","12","10 1/4","8 3/4","15"),
("WD122XHD",8.000,125000,150000,"2 5/8",None,"1","12 3/4","10 1/2","8 3/4","17.6"),
("WD480",8.000,85000,102000,"2 1/2",None,"1","14 1/2","12 3/4","11","16.9"),
("WD480XHD",8.000,122000,146000,"2 5/8",None,"1","15 1/4","13","11","19.5"),
]
for n,p,t1,t2,sbh,rv,ow,lob,mst,wt in [(r[0],r[1],r[2],r[3],r[4],r[6],r[7],r[8],r[9],r[10]) for r in DRAGT]:
    add(n,DR,p,t1,t2,wt,sbh,rv,None,E(ow,lob,None,mst),dt,mm_,"Welded Steel Drag Chain",nr="TRUE")
# SuperMac / MegaMac
for suf,lbl,bar_note in [("SM","SuperMac",""),("MM","MegaMac",".400-inch round barrel")]:
    base=[("WD118%s"%suf,8.000,(85000 if suf=="SM" else 85000),120000,"2 1/2","1","16 5/8","14 7/8","13 1/4",(20.8 if suf=="SM" else 23)),
          ("WD118XHD%s"%suf,8.000,125000,150000,"2 5/8","1","17 3/8","15 1/8","13 1/4",(24 if suf=="SM" else 26)),
          ("WD120%s"%suf,6.000,85000,120000,"2 1/2","1","12","10 1/4","8 3/4",(19.5 if suf=="SM" else 24)),
          ("WD120XHD%s"%suf,6.000,125000,150000,"2 5/8","1","12 3/4","10 1/2","8 3/4",(24 if suf=="SM" else 27)),
          ("WD122%s"%suf,8.000,85000,120000,"2 1/2","1","12","10 1/4","8 3/4",(17.5 if suf=="SM" else 20)),
          ("WD122XHD%s"%suf,8.000,125000,150000,"2 5/8","1","12 3/4","10 1/2","8 3/4",(20 if suf=="SM" else 22)),
          ("WD480%s"%suf,8.000,85000,120000,"2 1/2","1","14 1/2","12 3/4","11",(20 if suf=="SM" else 22.5)),
          ("WD480XHD%s"%suf,8.000,125000,150000,"2 5/8","1","15 1/4","13","11",(23 if suf=="SM" else 25))]
    for n,p,t1,t2,sbh,rv,ow,lob,mst,wt in base:
        add(n,DR,p,t1,t2,wt,sbh,rv,None,E(ow,lob,None,mst,note=bar_note),dt,"carbon steel,heat-treated, induction-hardened",lbl+" Drag Chain",nr="TRUE")
# MALLEABLE cast (single tensile)
for n,p,t,sbh,rivet,wt,extra in [
 ("H60",2.308,7000,"3/4","5/16","2.1",E(overall_width_in="2 17/32",max_sprocket_thk_in="1 1/2")),
 ("H74",2.609,10000,"1","3/8","3",E(overall_width_in="2 7/8",max_sprocket_thk_in="1 21/32")),
 ("H78",2.609,16000,"1 1/8","1/2","4.2",E(overall_width_in="3 13/16",max_sprocket_thk_in="1 7/8")),
 ("H82",3.075,20000,"1 1/4","9/16","5.5",E(overall_width_in="3 7/8",max_sprocket_thk_in="2 1/8"))]:
    add(n,DR,p,t,None,wt,sbh,rivet,None,extra,"sawmill,mill,malleable","malleable cast steel","Malleable Cast Steel Mill Chain")
# COMBINATION C (single tensile) -- C-prefix MAC malleable combination (NOT ANSI roller)
for n,p,t,sbh,sbt,rivet,ow,lob,mst,bar,wt in [
 ("C55",1.631,9000,"3/4","3/16","3/8","2","1 3/16","3/4","23/32","2.1"),
 ("C77",2.308,11000,"7/8","3/16","7/16","2 1/8","1 1/4","3/4","3/4","3"),
 ("C188",2.609,14000,"1 1/8","1/4","1/2","2 5/8","1 9/16","7/8","7/8","4.2"),
 ("C131",3.075,24000,"1 1/2","3/8","5/8","3 5/16","2","1 1/8","1 7/32","5.5"),
 ("C102B",4.000,24000,"1 1/2","3/8","5/8","4 9/16","2 25/32","1 3/4","31/32","4.2")]:
    add(n,DR,p,t,None,wt,sbh,rivet,bar,E(ow,lob,sbt,mst),"sawmill,mill,combination,malleable","malleable iron centre,carbon steel sidebars",
        "Steel/Malleable Combination Chain",note="C-prefix = MAC malleable-combination link (NOT standard ANSI roller chain).")
# ENGINEERED CLASS bushed (MS-series) single tensile
for n,p,t,sbh,rivet,ow,lob,wt in [
 ("MS188",2.609,25000,"1 1/8","1/2","2 11/16","1 9/16","3.8"),
 ("MS131",3.075,40000,"1 1/2","5/8","3 9/16","2","8.3"),
 ("MS102B",4.000,40000,"1 1/2","5/8","4 11/32","2 7/8","6.9"),
 ("MS110",6.000,40000,"1 1/2","5/8","4 11/32","2 7/8","6.3")]:
    add(n,ENG,p,t,None,wt,sbh,rivet,None,E(overall_width_in=ow,length_bearing_in=lob),"engineered class,conveyor,sawmill","steel bushed","Engineered Class Steel Bushed Chain")
# 81X engineered roller (straight/offset) single tensile + roller
for n,p,t,sbh,rivet,ow,roller,wt,desc in [
 ("81X",2.609,24000,"1 1/8","7/16","2 1/8","29/32","2.6","81X Steel Bushed Roller Chain (straight sidebar)"),
 ("81X-HD",2.609,42800,"1 1/4","7/16","2 9/16","29/32","4.0","81X Heavy Duty Roller Chain"),
 ("81X-XHD",2.609,42800,"1 1/4","7/16","2 3/4","29/32","4.5","81X Extra Heavy Duty Roller Chain"),
 ("LXS882",2.609,29000,"1 1/8","7/16","2 1/2",None,"3.6","LXS882 Offset Sidebar Roller Chain")]:
    add(n,ENG,p,t,None,wt,sbh,rivet,roller,E(overall_width_in=ow),"sawmill,lumber conveyor,trimmer","steel bushed roller",desc)
# Sorter 3939 / 900 (steel bushed roller, single tensile + roller)
for n,p,t,sbh,rivet,ow,roller,wt in [
 ("M3939",8.000,24000,"1 1/8","7/16","2 1/8","1 1/2",None),
 ("M3939-HD",8.000,37000,"1 1/8","7/16","2 9/16","1 1/2",None),
 ("M900",9.000,28000,"1.580","3/4","2 3/16","1 7/8","3.1")]:
    add(n,ENG,p,t,None,wt,sbh,rivet,roller,E(overall_width_in=ow),"sawmill,sorter,lumber,extended pitch","steel bushed roller","Extended Pitch Sorter Chain",
        note="M3939 = MAC extended-pitch sorter (a.k.a. 81X-8 family).")
# STEEL PINTLE (M-series) single tensile
for n,p,t,sbh,sbt,rivet,ow,mst,wt in [
 ("M662",1.664,11000,"0.720","0.125","0.281","1.720","0.750","1.05"),
 ("M667X",2.250,21000,"0.938","0.170","0.437","2.156","0.875","1.86"),
 ("M667H",2.313,12500,"0.875","0.125","0.312","1.906","0.875","1.65"),
 ("M667KC",2.250,30000,"1.062","0.200","0.437","2.359","0.875","2.56"),
 ("M667XH",2.250,28000,"1.05","0.225","0.465","2.414","0.875","2.8"),
 ("M88K",2.609,24500,"1.063","0.200","0.437","2.315","1","2.3"),
 ("M88C",2.609,38000,"1.125","0.250","0.500","2.842","1","3.3"),
 ("M308C",3.075,50000,"1.500","0.312","0.625","2.859","1.125","5.63")]:
    add(n,PINF,p,t,None,wt,sbh,rivet,None,E(overall_width_in=ow,sidebar_thk_in=sbt,max_sprocket_thk_in=mst),"pintle,conveyor,sawmill","formed/cast steel","Steel Pintle Chain")
# SANDER (M..-A) single tensile
for n,p,t,sbh,sbt,rivet,ow,mst,wt in [
 ("M662-A",1.664,11000,"0.720","0.125","0.281","1.720","0.750","1.4"),
 ("M667X-A",2.250,21000,"0.938","0.170","0.437","2.156","0.875","1.92"),
 ("M667H-A",2.313,12500,"0.875","0.125","0.312","1.906","0.875","1.65"),
 ("M667K-A",2.250,24500,"1.062","0.200","0.437","2.359","1","2.56"),
 ("M667KC-A",2.250,30000,"1.062","0.200","0.437","2.359","1","2.56"),
 ("M667XH-A",2.250,28000,"1.05","0.225","0.465","2.414","1","2.8"),
 ("C77SS",2.308,11000,"0.875","0.1875","0.4375","2.125","0.750","3")]:
    add(n,PINF,p,t,None,wt,sbh,rivet,None,E(overall_width_in=ow,sidebar_thk_in=sbt,max_sprocket_thk_in=mst),"pintle,sander,salting,conveyor","formed steel","Sander / Pintle Chain")
# LONG LINK (breaking load + working load)
for n,Dia,W,P,bl,proof,maxwl,wt in [
 ("LL-7/8x1.5x6","7/8","1 1/2","6",93000,41000,20540,"5.4"),
 ("LL-1x1.75x6","1","1 3/4","6",122000,54000,27000,"7.2"),
 ("LL-1.125x2x6","1 1/8","2","6",143000,64000,32000,"9.5"),
 ("LL-1.25x2x6","1 1/4","2","6",180000,82000,41000,"13.0")]:
    add(n,SPC,frac(P),bl,None,wt,None,Dia,None,E(inside_width_in=W,proof_test_lbs=str(proof)),"long link,alloy steel,bulk handling","AISI 1330 alloy, 34-36 Rc",
        "Alloy Steel Long Link Chain",work=maxwl,note="Breaking load -> tensile_lbs; proof test in extra_dims; max working load -> working_load.")
# SPECIAL: DF3500, Waste Water, Paver
add("DF3500",SPC,3.0,48000,None,"3.3","1 1/4","9/16",None,E(pitch_p2_in="2 1/2",sidebar_thk_in="1/4",max_overall_width_in="1 7/16",min_flex_radius_deg="20"),
    "double-flex,special application","carbon steel","DF3500 Double-Flex Chain",nr="TRUE",note="Dual pitch P1=3 / P2=2.5; trailing dims attribution uncertain (needs_review).")
for n,p,t1,t2,sbh,rivet,ow,lob,roller,wt in [
 ("WR720S",6.000,42500,50400,"1 1/2","3/4","3 9/16","1 1/8","1 1/4","6"),
 ("WR730S",6.000,42500,50400,"1 3/4","3/4","3 9/16","1 1/8","1 1/4","6.78")]:
    add(n,WS,p,t1,t2,wt,sbh,rivet,roller,E(overall_width_in=ow,length_bearing_in=lob),"waste water,welded steel,class 700","carbon steel,heat-treated",
        "Class 700 Welded Steel Waste Water Chain",nr="TRUE")
# STANDARD families (dedupe at import): double pitch + agricultural
for n,p,t,sbh,sbt,rivet,ow,mst,roller,wt,fam,desc,std in [
 ("C2060H",1.5,12300,"0.670","0.125","0.234","1.221","0.500","0.469","0.930",DP,"Double Pitch Conveyor Roller Chain","ANSI/ASME B29.4"),
 ("C2080H",2.0,20200,"0.890","0.156","0.312","1.528","0.625","0.625","1.560",DP,"Double Pitch Conveyor Roller Chain","ANSI/ASME B29.4"),
 ("C2100H",2.5,30800,"1.126","0.187","0.375","1.800","0.750","0.750","2.330",DP,"Double Pitch Conveyor Roller Chain","ANSI/ASME B29.4"),
 ("CA550",1.630,11250,"0.750","0.105","0.281","1.5","0.7969","0.656","1.300",AG,"Agricultural Roller Chain","ANSI CA-series"),
 ("CA620",1.654,12000,"0.750","0.125","0.281","1.75","0.9844","0.696","1.570",AG,"Agricultural Roller Chain","ANSI CA-series")]:
    add(n,fam,p,t,None,wt,sbh,rivet,roller,E(overall_width_in=ow,sidebar_thk_in=sbt,max_sprocket_thk_in=mst),
        "conveyor,agriculture" if fam==AG else "conveyor,double pitch",("alloy steel" if fam==AG else "carbon steel"),desc,
        standard=std,note="Standard ANSI number — DEDUPE to existing registry record; merge pn_macchain + dims; flag tensile differences.")

with open("drive/PKG-09_macchain.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=HDR);w.writeheader()
    for r in rows: w.writerow(r)
print("wrote",len(rows),"rows")
