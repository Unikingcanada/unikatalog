#!/usr/bin/env python3
import json, csv, re
HDR=["chain_id","chain_family","chain_number","display_name","standard","pitch_in","pitch_mm","strands","status","provenance","needs_review","description","application_tags","materials_available","options_upgrades","roller_dia_in","roller_dia_mm","inner_width_in","inner_width_mm","pin_dia_in","pin_dia_mm","plate_height_in","plate_height_mm","weight_lbs_ft","weight_kg_m","extra_dims_json","tensile_lbs","tensile_kn","working_load_lbs","working_load_kn","temp_min_c","temp_max_c","lubrication","perf_source","pn_webster","image_url","drawing_url","uniking_notes"]
def wfrac(s):
    if s in (None,""): return None
    s=str(s).replace('⁄','/').replace('½','1/2').strip()
    if '/' not in s:
        try: return float(s)
        except: return None
    try:
        pre,den=s.split('/'); den=int(den); pre=pre.strip()
        if len(pre)>=2 and int(pre[-2:])<den:
            num=int(pre[-2:]); whole=pre[:-2]
        else:
            num=int(pre[-1:]); whole=pre[:-1]
        return (int(whole) if whole else 0)+num/den
    except: return None
def n(x): return "" if x in (None,"") else (str(int(x)) if isinstance(x,float) and x==int(x) else str(round(x,4) if isinstance(x,float) else x))
def di(v): return "" if v is None else f"{round(v,3):.3f}".rstrip("0").rstrip(".")
def dm(v): return "" if v is None else str(round(v*25.4,2))
def knl(x): return "" if x in (None,"") else str(round(float(x)/224.809,1))
def wkg(lbsft): return "" if lbsft in (None,"") else str(round(float(lbsft)*1.488,3))
SRC="Webster Industries Chain Catalog (websterchain.com)"
rows=[];seen=set()
def add(num,fam,pitch,ult,rwl,wt,desc,tags,mats,pin=None,roller=None,plate=None,iw=None,extra=None,nr="FALSE",note="",tmax=None):
    cid="WEBSTER-"+re.sub(r'[^A-Za-z0-9]+','-',num).strip('-').upper()
    if cid in seen: return
    seen.add(cid)
    rows.append({"chain_id":cid,"chain_family":fam,"chain_number":num,"display_name":f"Webster {num} {desc}",
      "standard":"","pitch_in":n(pitch),"pitch_mm":(str(round(pitch*25.4,2)) if pitch else ""),"strands":"1","status":"Active",
      "provenance":"catalog-verified","needs_review":nr,"description":desc,"application_tags":tags,
      "materials_available":mats,"options_upgrades":"",
      "roller_dia_in":di(roller),"roller_dia_mm":dm(roller),"inner_width_in":di(iw),"inner_width_mm":dm(iw),
      "pin_dia_in":di(pin),"pin_dia_mm":dm(pin),"plate_height_in":di(plate),"plate_height_mm":dm(plate),
      "weight_lbs_ft":n(wt),"weight_kg_m":wkg(wt),"extra_dims_json":(json.dumps(extra) if extra else ""),
      "tensile_lbs":n(ult),"tensile_kn":(knl(ult) if ult not in (None,"") else ""),
      "working_load_lbs":n(rwl),"working_load_kn":(knl(rwl) if rwl not in (None,"") else ""),
      "temp_min_c":"","temp_max_c":(n(tmax) if tmax else ""),"lubrication":"","perf_source":SRC,
      "pn_webster":num,"image_url":"","drawing_url":"","uniking_notes":note})
PIN="Steel Pintle Chains";DR="Drag / Scraper Chains";SB="Steel Bushed Chains"
# 400 CLASS PINTLE: (num,pitch,wt,ult_mall,ult_dur,wl_mall,wl_dur, X,F,A,D,H,K,J)
P400=[
("442",1.375,1.4,6000,7500,830,995,"11⁄16","3⁄4","5⁄8","5⁄16","9⁄16","11⁄16","1"),
("445",1.630,1.5,6000,7500,830,995,"11⁄16","23⁄32","11⁄16","5⁄16","5⁄8","11⁄16","1"),
("452",1.506,2.0,7000,8750,1055,1265,"11⁄8","27⁄32","5⁄8","3⁄8","11⁄16","11⁄16","1"),
("455",1.630,1.9,7300,9125,1055,1265,"11⁄8","13⁄16","11⁄16","3⁄8","5⁄8","11⁄8","11⁄32"),
("462",1.634,2.5,9000,11250,1500,1800,"17⁄16","15⁄16","7⁄8","7⁄16","13⁄16","15⁄16","11⁄4"),
("477",2.308,2.0,9600,12000,1365,1640,"11⁄4","1","11⁄16","7⁄16","13⁄16","19⁄32","15⁄32"),
("488",2.609,2.9,11000,13750,1775,2130,"15⁄8","15⁄16","15⁄16","7⁄16","7⁄8","17⁄16","15⁄16"),
("4103",3.075,5.7,22000,27500,3515,4218,"17⁄8","11⁄2","11⁄8","3⁄4","11⁄4","127⁄32","125⁄32"),
("4124",4.063,8.5,33000,41250,4570,5485,"21⁄4","13⁄4","11⁄4","13⁄16","111⁄16","213⁄32","25⁄32"),
]
for num,p,wt,um,ud,wm,wd,X,F,A,D,H,K,J in P400:
    add(num,PIN,p,um,wm,wt,"400-Class Pintle Chain","pintle,conveyor,elevator","malleable iron,Duramal",
        pin=wfrac(D),roller=wfrac(H),extra={"barrel_length_X_in":X,"sidebar_width_F_in":F,"max_spkt_width_A_in":A,"to_cotter_K_in":K,"to_head_J_in":J,"duramal_ultimate_lbs":ud,"duramal_working_lbs":wd},
        note=f"Webster 400-class pintle. tensile/working = MALLEABLE iron base; Duramal variant ult {ud} lbs / WL {wd} lbs (in extra_dims). Interchangeable with standard makes of corresponding size.")
# 700 CLASS PINTLE (Duramal): (num,pitch,wt,ult,wl,X,F,A,D,H,K,J)
P700=[
("720",6.000,4.2,27500,3860,"17⁄8","11⁄2","11⁄8","11⁄16","13⁄8","17⁄8","111⁄16"),
("720S",6.000,5.2,37500,4245,"17⁄8","19⁄16","11⁄8","3⁄4","17⁄16","21⁄8","113⁄16"),
("720NCS",6.000,5.4,37500,4245,"17⁄8","19⁄16","11⁄8","3⁄4","17⁄16","21⁄8","113⁄16"),
("730",6.000,6.0,40000,4500,"2","13⁄4","11⁄8","3⁄4","11⁄2","21⁄16","17⁄8"),
("730S",6.000,6.0,40000,4500,"2","13⁄4","11⁄4","3⁄4","11⁄2","21⁄16","113⁄16"),
("730NCS",6.000,6.0,40000,4500,"2","13⁄4","15⁄32","3⁄4","11⁄2","23⁄32","125⁄32"),
]
for num,p,wt,ult,wl,X,F,A,D,H,K,J in P700:
    add(num,PIN,p,ult,wl,wt,"700-Class Pintle Chain","pintle,conveyor,elevator,water treatment","Duramal",
        pin=wfrac(D),roller=wfrac(H),extra={"barrel_length_X_in":X,"sidebar_width_F_in":F,"to_cotter_K_in":K,"to_head_J_in":J},
        note="NCS suffix = curved sidebars and pear-shaped barrels." if "NCS" in num else "")
# COMBINATION standard: (num,pitch,wt,ult,wl,F,A,D,H_pin,K_barrel,T)
COMB=[
("WC55",1.631,2.0,11250,1370,"17⁄32","3⁄4","11⁄16","3⁄8","23⁄32","3⁄16"),
("N77",2.308,2.2,13750,1640,"11⁄4","7⁄8","11⁄16","7⁄16","23⁄32","3⁄16"),
("N102B",4.000,6.7,30000,5000,"27⁄8","11⁄2","115⁄16","5⁄8","1","3⁄8"),
("N102H",4.040,9.4,45000,6600,"215⁄16","13⁄4","2","3⁄4","13⁄8","3⁄8"),
("N110",6.000,6.0,30000,5000,"27⁄8","11⁄2","115⁄16","5⁄8","11⁄4","3⁄8"),
("N111",4.760,9.7,45000,7500,"33⁄8","13⁄4","23⁄8","3⁄4","17⁄16","3⁄8"),
("N131",3.075,6.5,30000,3750,"2","11⁄2","11⁄8","5⁄8","11⁄4","3⁄8"),
("N132",6.050,14.4,62500,10400,"43⁄8","2","31⁄8","1","13⁄4","1⁄2"),
("WC188",2.609,3.6,17500,2340,"19⁄16","11⁄8","15⁄16","1⁄2","7⁄8","1⁄4"),
]
for num,p,wt,ult,wl,F,A,D,Hp,Kb,T in COMB:
    add(num,DR,p,ult,wl,wt,"Combination Chain","combination,conveyor,elevator,mill","malleable iron centre,carbon steel sidebars",
        pin=wfrac(Hp),roller=wfrac(Kb),extra={"barrel_length_F_in":F,"sidebar_width_A_in":A,"max_spkt_width_D_in":D,"sidebar_thk_T_in":T},
        note="WC55/WC188 = Webster C55/C188 (W prefix to avoid collision with welded-steel combination C-numbers of other brands)." if num in("WC55","WC188") else "")
# N111SPC dual pitch
add("N111SPC",DR,4.760,45000,7500,8.5,"Combination Chain (special, dual-pitch)","combination,conveyor","malleable iron centre,carbon steel sidebars",
    extra={"pitch_2_in":"7.240"},note="Dual pitch 4.760/7.240; pitch_in lists primary 4.760 (second in extra_dims).",nr="TRUE")
# WS/DW combination: (num,pitch,wt,ult,wl,F,A,D,Hpin,Kbar,W,T)
WSDW=[
("DW111",4.760,10.6,45000,7500,"33⁄8","13⁄4","23⁄8","3⁄4","17⁄16","43⁄4","3⁄8"),
("N131WS",3.075,7.2,30000,3750,"2","11⁄2","11⁄8","5⁄8","11⁄4","3","3⁄8"),
("DW132",6.050,16.7,62500,10400,"43⁄8","2","31⁄8","1","13⁄4","6","1⁄2"),
("N132WS",6.050,14.8,62500,10400,"43⁄8","2","31⁄8","1","13⁄4","6","1⁄2"),
("C188WS",2.609,4.0,17500,2340,"19⁄16","11⁄8","15⁄16","1⁄2","7⁄8","21⁄2","1⁄4"),
]
for num,p,wt,ult,wl,F,A,D,Hp,Kb,W,T in WSDW:
    add(num,DR,p,ult,wl,wt,"WS/DW Combination Chain (wear-shoe)","combination,conveyor,wear shoe","malleable iron centre,carbon steel sidebars",
        pin=wfrac(Hp),roller=wfrac(Kb),extra={"barrel_length_F_in":F,"sidebar_width_A_in":A,"wear_shoe_width_W_in":W,"sidebar_thk_T_in":T})
# Outboard roller combination (no weight): (num,pitch,ult,wl,F,A,D,Hpin,Kbar,E_roller,W,R,S,T)
ORC=[
("CRN110",6.000,30000,4800,"27⁄8","11⁄2","115⁄16","5⁄8","11⁄4","2","65⁄8","411⁄16","7⁄8","3⁄8"),
("CRN111",4.760,45000,7500,"33⁄8","13⁄4","23⁄8","3⁄4","17⁄16","21⁄4","73⁄8","51⁄4","15⁄16","3⁄8"),
("CRN131",3.075,30000,3750,"2","11⁄2","11⁄8","5⁄8","11⁄4","2","53⁄4","313⁄16","7⁄8","3⁄8"),
("CRN132",6.050,62500,10400,"43⁄8","2","31⁄8","1","13⁄4","3","9","65⁄8","11⁄8","1⁄2"),
("CR188",2.609,17500,2340,"19⁄16","11⁄8","15⁄16","1⁄2","7⁄8","11⁄2","43⁄8","213⁄16","5⁄8","1⁄4"),
]
for num,p,ult,wl,F,A,D,Hp,Kb,E,W,R,S,T in ORC:
    add(num,DR,p,ult,wl,None,"Outboard Roller Combination Chain","combination,conveyor,outboard roller","malleable iron centre,carbon steel sidebars",
        pin=wfrac(Hp),roller=wfrac(E),extra={"barrel_length_F_in":F,"sidebar_width_A_in":A,"barrel_dia_K_in":Kb,"to_rollers_R_in":R,"roller_face_S_in":S,"sidebar_thk_T_in":T})
# HSB chains spec (num,pitch,wt,ult,rwl,T,F_height,W_innerwidth) + dim dict pin/bush
HSB=[
("HSB188",2.609,3.8,25000,2730,"1⁄4","11⁄8","11⁄16"),("HSB1663",2.609,7.4,38000,3200,"3⁄8","11⁄2","11⁄16"),
("HSB131",3.075,7.4,40000,4380,"3⁄8","11⁄2","11⁄4"),("HSB102B",4.000,6.9,40000,6290,"3⁄8","11⁄2","21⁄8"),
("HSB825",4.000,8.7,60000,5900,"3⁄8","2","11⁄2"),("HSB102H",4.040,9.4,50000,7700,"3⁄8","13⁄4","23⁄16"),
("HSB6472",4.040,9.8,72000,6125,"3⁄8","2","11⁄4"),("HSB4933",4.040,11.0,72000,9200,"3⁄8","2","21⁄4"),
("HSB111",4.760,10.2,50000,8850,"3⁄8","2","25⁄8"),("HSB5131",5.000,6.2,40000,4380,"3⁄8","11⁄2","11⁄4"),
("HSB1316",6.000,5.9,40000,4650,"3⁄8","11⁄2","13⁄8"),("HSB2730",6.000,7.7,50000,5575,"3⁄8","13⁄4","13⁄8"),
("HSB835",6.000,8.1,60000,5900,"3⁄8","2","11⁄2"),("HSB110",6.000,6.3,40000,6290,"3⁄8","11⁄2","21⁄8"),
("HSB830",6.000,7.5,60000,5900,"3⁄8","2","11⁄2"),("HSB833",6.000,9.0,50000,8850,"3⁄8","2","25⁄8"),
("HSB844",6.000,10.4,65000,9200,"1⁄2","2","21⁄2"),("HSB826",6.000,14.0,95000,9570,"3⁄8","21⁄2","23⁄8"),
("HSB860B",6.000,15.0,100000,10500,"1⁄2","21⁄2","2"),("HSB856B",6.000,16.2,100000,14000,"1⁄2","21⁄2","3"),
("HSB956",6.000,17.3,100000,14000,"1⁄2","3","3"),("HSB857A",6.000,21.0,130000,14000,"1⁄2","31⁄4","3"),
("HSB2858A",6.000,24.1,150000,15300,"1⁄2","31⁄2","21⁄2"),("HSB850",6.000,23.5,200000,16000,"5⁄8","3","21⁄4"),
("HSB859B",6.000,34.0,200000,21875,"5⁄8","4","33⁄4"),("HSB1654",6.000,32.0,230000,18375,"5⁄8","4","21⁄4"),
("HSB851",6.000,30.0,200000,24500,"5⁄8","31⁄2","23⁄4"),("HSB150",6.050,16.6,100000,15100,"1⁄2","21⁄2","33⁄8"),
("HSB864B",7.000,32.0,200000,21875,"5⁄8","4","33⁄4"),("HSB984",7.000,31.0,200000,24000,"5⁄8","4","33⁄4"),
("HSB2866",7.000,35.4,200000,27370,"5⁄8","4","41⁄2"),("HSB886",7.000,42.0,350000,24200,"3⁄4","4","23⁄4"),
("HSB187",8.000,2.5,25000,2730,"1⁄4","11⁄8","11⁄16"),("HSB1856",8.000,13.9,100000,14000,"1⁄2","21⁄2","3"),
("HSB1219",9.000,8.0,50000,8850,"3⁄8","2","25⁄8"),("HSB9124",9.000,12.8,100000,10500,"1⁄2","21⁄2","2"),
("HSB1956",9.000,13.1,100000,14000,"1⁄2","21⁄2","3"),("HSB9150",9.000,14.1,100000,15100,"1⁄2","21⁄2","33⁄8"),
("HSB1903",9.000,16.7,110000,15100,"1⁄2","3","33⁄8"),("HSB959",9.000,28.2,200000,21875,"5⁄8","31⁄2","33⁄4"),
("HSB964",9.000,26.9,200000,21875,"5⁄8","4","33⁄4"),("HSB6322",12.000,7.1,50000,7200,"3⁄8","2","2"),
("HSB6102H",12.000,7.0,50000,7700,"3⁄8","2","23⁄16"),("HSB6124",12.000,11.7,100000,10500,"1⁄2","21⁄2","21⁄2"),
("HSB852",12.000,12.6,100000,15100,"1⁄2","2","33⁄8"),("HSB1259",12.000,25.2,200000,21875,"5⁄8","31⁄2","33⁄4"),
]
HSBDIM={ # num: (pin_dia D, bushing OD H)
"HSB188":("1⁄2","7⁄8"),"HSB1663":("1⁄2","7⁄8"),"HSB131":("5⁄8","11⁄4"),"HSB102B":("5⁄8","1"),"HSB825":("3⁄4","11⁄8"),
"HSB102H":("3⁄4","13⁄8"),"HSB6472":("7⁄8","13⁄8"),"HSB4933":("7⁄8","13⁄8"),"HSB111":("3⁄4","17⁄16"),"HSB5131":("5⁄8","11⁄4"),
"HSB1316":("5⁄8","11⁄4"),"HSB2730":("3⁄4","13⁄8"),"HSB835":("3⁄4","11⁄8"),"HSB110":("5⁄8","11⁄4"),"HSB830":("3⁄4","11⁄8"),
"HSB833":("3⁄4","17⁄16"),"HSB844":("3⁄4","11⁄8"),"HSB826":("7⁄8","11⁄2"),"HSB860B":("1","13⁄4"),"HSB856B":("1","13⁄4"),
"HSB956":("1","13⁄4"),"HSB857A":("1","13⁄4"),"HSB2858A":("11⁄4","23⁄8"),"HSB850":("15⁄16","2"),"HSB859B":("11⁄4","23⁄8"),
"HSB1654":("11⁄2","21⁄2"),"HSB851":("13⁄4","23⁄8"),"HSB150":("1","13⁄4"),"HSB864B":("11⁄4","23⁄8"),"HSB984":("13⁄8","21⁄2"),
"HSB2866":("1.36","23⁄8"),"HSB886":("15⁄8","25⁄8"),"HSB187":("1⁄2","7⁄8"),"HSB1856":("1","13⁄4"),"HSB1219":("3⁄4","17⁄16"),
"HSB9124":("1","13⁄4"),"HSB1956":("1","13⁄4"),"HSB9150":("1","13⁄4"),"HSB1903":("1","13⁄4"),"HSB959":("11⁄4","23⁄8"),
"HSB964":("11⁄4","23⁄8"),"HSB6322":("3⁄4","11⁄2"),"HSB6102H":("3⁄4","13⁄8"),"HSB6124":("1","13⁄4"),"HSB852":("1","13⁄4"),"HSB1259":("11⁄4","23⁄8"),
}
for num,p,wt,ult,rwl,T,F,W in HSB:
    D,H=HSBDIM.get(num,(None,None))
    add(num,SB,p,ult,rwl,wt,"Hardened Steel Bushed (HSB) Chain","engineered class,conveyor,bushed,hardened","M.C.H.T. sidebars,alloy HT pins/bushings",
        pin=wfrac(D),roller=wfrac(H),plate=wfrac(F),iw=wfrac(W),extra={"sidebar_thk_T_in":T},
        note=("H suffix here = '1/2' embedded fraction (e.g. HSB102H = HSB102 1/2)." if num.endswith("H") and num not in ("HSB860B",) else ""))
# TS chains (4 complete)
for num,p,wt,ult,rwl,T,F,W,K,J,D,H in [
 ("TS856",6.000,16.2,150000,14000,"1⁄2","21⁄2","3","3","227⁄32","1","13⁄4"),
 ("TS956",6.000,17.3,150000,14000,"1⁄2","3","3","3","227⁄32","1","13⁄4"),
 ("TS857",6.000,21.0,150000,14000,"1⁄2","31⁄4","3","35⁄32","227⁄32","1","13⁄4"),
 ("TS859",6.000,34.0,250000,21875,"5⁄8","4","33⁄4","325⁄32","315⁄32","11⁄4","23⁄8")]:
    add(num,SB,p,ult,rwl,wt,"TS Hardened Steel Bushed Chain","engineered class,conveyor,bushed,hardened","M.C.H.T. sidebars,alloy HT pins/bushings",
        pin=wfrac(D),roller=wfrac(H),plate=wfrac(F),iw=wfrac(W),extra={"sidebar_thk_T_in":T,"to_cotter_K_in":K,"to_head_J_in":J})

with open("drive/PKG-08_webster.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=HDR);w.writeheader()
    for r in rows: w.writerow(r)
print("wrote",len(rows),"rows")
