import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

const VESSELS = ["Express","Mavendra","Prakarsa","Pratama","Segoro","Selaras","Sahabat","Semangat"];
const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const ADMIN_EMAIL = "dwi.wahyu@mentarimas.id";

const FORMS = [
  {code:"009-A", dept:"Deck",   pic:"Master", ket:"BLN"},
  {code:"009-B", dept:"Deck",   pic:"Master", ket:"TRW"},
  {code:"018",   dept:"Deck",   pic:"CO",     ket:"BLN"},
  {code:"022",   dept:"Deck",   pic:"Master", ket:"BLN"},
  {code:"023",   dept:"Deck",   pic:"Master", ket:"BLN"},
  {code:"024",   dept:"Deck",   pic:"Master", ket:"BLN"},
  {code:"025",   dept:"Deck",   pic:"Master", ket:"2 BLN"},
  {code:"026",   dept:"Deck",   pic:"Master", ket:"TRW"},
  {code:"027",   dept:"Deck",   pic:"Master", ket:"TRW"},
  {code:"028",   dept:"Deck",   pic:"Master", ket:"TRW"},
  {code:"038",   dept:"Deck",   pic:"CO",     ket:"TRW"},
  {code:"040 A", dept:"Engine", pic:"CE",     ket:"BLN"},
  {code:"040 C", dept:"Engine", pic:"CE",     ket:"BLN"},
  {code:"041",   dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"042",   dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"043",   dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"044",   dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"045",   dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"046",   dept:"Engine", pic:"2E",     ket:"Voy"},
  {code:"048",   dept:"Engine", pic:"2E",     ket:"SMT"},
  {code:"059-A", dept:"Deck",   pic:"CO",     ket:"BLN"},
  {code:"059-B", dept:"Engine", pic:"CE",     ket:"TRW"},
  {code:"059-C", dept:"Deck",   pic:"CO",     ket:"BLN"},
  {code:"059-D", dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"059-E", dept:"Engine", pic:"CE",     ket:"BLN"},
  {code:"059-F", dept:"Deck",   pic:"CO",     ket:"BLN"},
  {code:"059-G", dept:"Deck",   pic:"Master", ket:"TRW"},
  {code:"059-H", dept:"Deck",   pic:"CO",     ket:"TRW"},
  {code:"059-I", dept:"Engine", pic:"2E",     ket:"BLN"},
  {code:"059-J", dept:"Engine", pic:"2E",     ket:"TRW"},
  {code:"060",   dept:"Deck",   pic:"Master", ket:"SMT"},
  {code:"061",   dept:"Deck",   pic:"CO",     ket:"Weekly"},
  {code:"073B",  dept:"Engine", pic:"CE",     ket:"Voy"},
  {code:"075",   dept:"Deck",   pic:"Master", ket:"Weekly"},
  {code:"084-A", dept:"Deck",   pic:"CO",     ket:"SMT"},
  {code:"084-B", dept:"Deck",   pic:"CO",     ket:"SMT"},
  {code:"084-C", dept:"Deck",   pic:"CO",     ket:"SMT"},
  {code:"084-D", dept:"Deck",   pic:"CO",     ket:"SMT"},
  {code:"084-E", dept:"Deck",   pic:"CO",     ket:"SMT"},
  {code:"084-F", dept:"Deck",   pic:"CO",     ket:"SMT"},
  {code:"093-A",  dept:"Deck",   pic:"Master", ket:"BLN"},
  {code:"096-B", dept:"Engine", pic:"CO", ket:"BLN", exclude:["Pratama", "Segoro", "Selaras", "Sahabat"]},
];

const PIC_RULES = {
  Master: () => true,
  CO:     f => f.pic === "CO",
  CE:     f => f.dept === "Engine",
  "2E":   f => f.pic === "2E",
};
const normCode = c => (c||"").replace(/[\s-]/g,"").toUpperCase();

function sched(ket) {
  switch(ket){
    case "BLN": case "Weekly": case "Voy": return Array(12).fill(1);
    case "2 BLN": return [1,0,1,0,1,0,1,0,1,0,1,0];
    case "TRW":   return [0,0,1,0,0,1,0,0,1,0,0,1];
    case "SMT":   return [0,0,0,0,0,1,0,0,0,0,0,1];
    default: return Array(12).fill(0);
  }
}

const YEAR_RATES = {
  2024: Object.fromEntries(VESSELS.map(v=>[v,Array(12).fill(1)])),
  2025: Object.fromEntries(VESSELS.map((v,i)=>[v,[1,1,1,1,0.97,0.95,0.93,0.90,0.88,0.92,0.85-i*0.01,0.82-i*0.01]])),
  2026: {
    Express:[1,1,1,1,1,0.975,0,0,0,0,0,0], Mavendra:[1,1,1,1,0.92,0.875,0,0,0,0,0,0],
    Prakarsa:[1,1,1,1,0.88,0.875,0,0,0,0,0,0], Pratama:[1,1,1,1,1,0.95,0,0,0,0,0,0],
    Segoro:[1,1,1,0.95,1,0.90,0,0,0,0,0,0], Selaras:[1,1,1,1,1,1,0,0,0,0,0,0],
    Sahabat:[1,1,1,1,0.92,0.87,0,0,0,0,0,0], Semangat:[1,1,1,1,1,0.925,0,0,0,0,0,0],
  },
  2027: Object.fromEntries(VESSELS.map(v=>[v,Array(12).fill(0)])),
};

function buildData(year) {
  let s=year+7; const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
  const rates=YEAR_RATES[year]||YEAR_RATES[2026]; const rows=[];
  VESSELS.forEach(v=>{ FORMS.forEach(f=>{ sched(f.ket).forEach((a,mi)=>{
    if(!a) return;
    const rate=(rates[v]||Array(12).fill(0))[mi];
    const status=rate===0?"S":rate===1?"C":rnd()<rate?"C":"S";
    rows.push({vessel:v,code:f.code,month:mi+1,status,dept:f.dept,pic:f.pic});
  }); }); });
  return rows;
}

function calcPIC(rows, picMonth, vessel) {
  const out={};
  const lookupNorm={};
  rows.forEach(r=>{
    const k=normCode(r.code||r.form_code||"");
    if(!lookupNorm[k]) lookupNorm[k]={};
    if(r.status==="C" || lookupNorm[k][r.month]==null) lookupNorm[k][r.month]=r.status;
  });
  Object.entries(PIC_RULES).forEach(([role,rule])=>{
    const matchedForms = FORMS.filter(f => (!f.exclude || !f.exclude.includes(vessel)) && rule(f));
    let expectedTotal = 0;
    matchedForms.forEach(f => {
      const scheduleArray = sched(f.ket);
      if (picMonth === "Semua") expectedTotal += scheduleArray.reduce((a,b)=>a+b,0);
      else expectedTotal += scheduleArray[Number(picMonth)-1];
    });
    let done=0;
    matchedForms.forEach(f=>{
      const k=normCode(f.code); const s=sched(f.ket);
      if(picMonth==="Semua") s.forEach((a,mi)=>{ if(a && lookupNorm[k]?.[mi+1]==="C") done++; });
      else { const mi=Number(picMonth)-1; if(s[mi] && lookupNorm[k]?.[mi+1]==="C") done++; }
    });
    out[role]={done,total:expectedTotal,pct:expectedTotal?Math.round(done/expectedTotal*100):0};
  });
  return out;
}

const clr=p=>p>=90?"#059669":p>=75?"#d97706":"#dc2626";
const bgc=p=>p>=90?"#d1fae5":p>=75?"#fef3c7":"#fee2e2";

function Bar({pct}){
  return <div style={{height:5,background:"#e5e7eb",borderRadius:3,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${pct}%`,background:clr(pct),borderRadius:3}}/>
  </div>;
}

function PICCards({rows, picMonth, vessel}){
  const scores=calcPIC(rows, picMonth, vessel);
  return <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
    {Object.entries(scores).map(([role,s])=>(
      <div key={role} style={{background:bgc(s.pct),borderRadius:8,padding:"8px 10px",border:`1px solid ${clr(s.pct)}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:4}}>
          <span style={{fontSize:10,fontWeight:700,color:"#374151"}}>{role}</span>
          <span style={{fontSize:16,fontWeight:800,color:clr(s.pct),lineHeight:1}}>{s.pct}%</span>
        </div>
        <Bar pct={s.pct}/>
        <div style={{fontSize:10,color:"#6b7280",marginTop:3}}>{s.done}/{s.total}</div>
      </div>
    ))}
  </div>;
}

function Cell({status, isAdmin, vessel, code, month, onToggle}){
  const dispStatus = status || "S";
  const st = dispStatus==="C" ? {background:"#bbf7d0",color:"#14532d",fontWeight:700}
    : {background:"#fef9c3",color:"#713f12",fontWeight:600};
  const clickable = isAdmin && code && vessel && month;
  const handleInteract = clickable ? (e) => {
    e.preventDefault();
    onToggle({vessel,code,month,status:dispStatus});
  } : undefined;
  return <td
    onClick={clickable ? ()=>onToggle({vessel,code,month,status:dispStatus}) : undefined}
    onTouchEnd={handleInteract}
    style={{
      textAlign:"center",fontSize:11,
      padding:clickable?"6px 2px":"4px 2px",
      border:"1px solid #e5e7eb",
      ...st,
      cursor:clickable?"pointer":"default",
      userSelect:"none",
      WebkitTapHighlightColor:"transparent",
      touchAction:"manipulation"
    }}>
    {dispStatus}
  </td>;
}

const TH={padding:"6px 5px",textAlign:"center",fontWeight:600,color:"#374151",border:"1px solid #e5e7eb",fontSize:11};
const TD={padding:"5px 6px",border:"1px solid #f1f5f9",fontSize:11};

function VesselTable({vessel,data,isAdmin,onToggle}){
  const [deptF,setDeptF]=useState("Semua");
  const [picMonth, setPicMonth] = useState(new Date().getMonth() + 1);
  const vRows=data.filter(d=>d.vessel===vessel);
  const lookup={};
  const lookupNorm={};
  vRows.forEach(r=>{
    const code = r.code || r.form_code || "";
    if(!lookup[code]) lookup[code]={};
    lookup[code][r.month]=r.status;
    const k=normCode(code);
    if(!lookupNorm[k]) lookupNorm[k]={};
    if(r.status==="C" || lookupNorm[k][r.month]==null) lookupNorm[k][r.month]=r.status;
  });
  const vesselForms = FORMS.filter(f => !f.exclude || !f.exclude.includes(vessel));
  const forms=deptF==="Semua"?vesselForms:vesselForms.filter(f=>f.dept===deptF);
  let expectedFormTotal = 0;
  forms.forEach(f => {
    const s = sched(f.ket);
    if (picMonth === "Semua") expectedFormTotal += s.reduce((a,b)=>a+b,0);
    else expectedFormTotal += s[Number(picMonth)-1];
  });
  let done = 0;
  forms.forEach(f=>{
    const k=normCode(f.code); const s=sched(f.ket);
    if(picMonth==="Semua") s.forEach((a,mi)=>{ if(a && lookupNorm[k]?.[mi+1]==="C") done++; });
    else { const mi=Number(picMonth)-1; if(s[mi] && lookupNorm[k]?.[mi+1]==="C") done++; }
  });
  const total = expectedFormTotal;
  const pct=total?Math.round(done/total*100):0;
  const mStats=MO.map((_,mi)=>{
    const m=mi+1;
    const expected = forms.filter(f=>sched(f.ket)[mi]).length;
    const d = forms.filter(f=>sched(f.ket)[mi] && lookupNorm[normCode(f.code)]?.[m]==="C").length;
    return{total:expected,done:d,pct:expected?Math.round(d/expected*100):null};
  });
  return <div>
    <div style={{background:"#1e3a5f",color:"#fff",padding:"14px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:15,fontWeight:800,letterSpacing:".04em"}}>{vessel.toUpperCase()} MAS</div>
            <select 
              value={picMonth} 
              onChange={e=>setPicMonth(e.target.value)}
              style={{padding:"2px 6px", fontSize:11, borderRadius:4, background:"#0f172a", color:"#fff", border:"1px solid #334155"}}
            >
              <option value="Semua">Semua Bulan</option>
              {MO.map((mName, i) => <option key={i+1} value={i+1}>{mName}</option>)}
            </select>
          </div>
          <div style={{fontSize:11,color:"#93c5fd",marginTop:4}}>{done}/{total} form · {pct}% progress {picMonth!=="Semua"?"(Bulan Ini)":"(Tahunan)"}</div>
        </div>
        <div style={{fontSize:32,fontWeight:800,color:pct>=90?"#34d399":pct>=75?"#fbbf24":"#f87171",lineHeight:1}}>{pct}%</div>
      </div>
      {isAdmin && <div style={{fontSize:10,color:"#fbbf24",marginTop:4,marginBottom:8}}>Admin edit mode aktif — klik cell C/S untuk toggle</div>}
      <PICCards rows={vRows} picMonth={picMonth} vessel={vessel}/>
    </div>
    <div style={{background:"#f8fafc",padding:"8px 16px",display:"flex",gap:6,borderBottom:"1px solid #e5e7eb",alignItems:"center"}}>
      <span style={{fontSize:11,color:"#64748b",marginRight:4}}>Dept:</span>
      {["Semua","Deck","Engine"].map(d=>(
        <button key={d} onClick={()=>setDeptF(d)} style={{padding:"3px 12px",fontSize:11,border:"1px solid",borderRadius:20,cursor:"pointer",
          background:deptF===d?"#1e3a5f":"#fff",color:deptF===d?"#fff":"#374151",borderColor:deptF===d?"#1e3a5f":"#d1d5db"}}>{d}</button>
      ))}
    </div>
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",fontSize:11}}>
        <thead>
          <tr style={{background:"#f1f5f9"}}>
            <th style={{...TH,width:28}}>#</th>
            <th style={{...TH,minWidth:65}}>Form</th>
            <th style={{...TH,minWidth:58}}>Dept</th>
            <th style={{...TH,minWidth:52}}>PIC</th>
            <th style={{...TH,minWidth:50}}>Freq</th>
            {MO.map((mn,mi)=>{
              const s=mStats[mi];
              const c=s.pct===null?"#94a3b8":s.pct===100?"#059669":s.pct>=80?"#d97706":"#dc2626";
              return <th key={mn} style={{...TH,minWidth:42}}>
                <div>{mn}</div>
                {s.pct!==null&&<div style={{fontSize:9,color:c,fontWeight:700,marginTop:1}}>{s.pct}%</div>}
              </th>;
            })}
          </tr>
        </thead>
        <tbody>
          {forms.map((f,i)=>{
            const sc2=sched(f.ket);
            return <tr key={f.code} style={{background:i%2===0?"#fff":"#fafafa"}}>
              <td style={{...TD,color:"#9ca3af",textAlign:"center"}}>{i+1}</td>
              <td style={{...TD,fontWeight:700,color:"#1e40af",textAlign:"center"}}>{f.code}</td>
              <td style={{...TD,textAlign:"center"}}>
                <span style={{padding:"1px 5px",borderRadius:3,fontSize:10,fontWeight:600,
                  background:f.dept==="Deck"?"#dbeafe":"#fce7f3",
                  color:f.dept==="Deck"?"#1e40af":"#9d174d"}}>{f.dept}</span>
              </td>
              <td style={{...TD,textAlign:"center",fontWeight:600,color:"#374151"}}>{f.pic}</td>
              <td style={{...TD,textAlign:"center",color:"#9ca3af"}}>{f.ket}</td>
              {MO.map((_,mi)=>{
                if(!sc2[mi]) return <td key={mi} style={{...TD,textAlign:"center",background:"#fce7f3",color:"#dc2626",fontWeight:700}}>X</td>;
                const st = lookup[f.code]?.[mi+1] || lookupNorm[normCode(f.code)]?.[mi+1] || "";
                return <Cell key={mi} status={st} isAdmin={isAdmin} vessel={vessel} code={f.code} month={mi+1} onToggle={onToggle}/>;
              })}
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </div>;
}

function SummaryView({data}){
  const [view,setView]=useState("bulan");
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const stats=VESSELS.map(v=>{
    const vRows=data.filter(d=>d.vessel===v);
    const vesselForms = FORMS.filter(f => !f.exclude || !f.exclude.includes(v));
    const lookupNorm={};
    vRows.forEach(r=>{
      const k=normCode(r.code||r.form_code||"");
      if(!lookupNorm[k]) lookupNorm[k]={};
      if(r.status==="C" || lookupNorm[k][r.month]==null) lookupNorm[k][r.month]=r.status;
    });
    let expectedFormTotal = 0;
    vesselForms.forEach(f => {
      const s = sched(f.ket);
      if (summaryMonth === "Semua") expectedFormTotal += s.reduce((a,b)=>a+b,0);
      else expectedFormTotal += s[Number(summaryMonth)-1];
    });
    let done=0;
    vesselForms.forEach(f=>{
      const k=normCode(f.code); const s=sched(f.ket);
      if(summaryMonth==="Semua") s.forEach((a,mi)=>{ if(a && lookupNorm[k]?.[mi+1]==="C") done++; });
      else { const mi=Number(summaryMonth)-1; if(s[mi] && lookupNorm[k]?.[mi+1]==="C") done++; }
    });
    const total = expectedFormTotal;
    const pct = total ? Math.round(done/total*100) : 0;
    const months=MO.map((_,mi)=>{
      const m=mi+1;
      const expected = vesselForms.filter(f=>sched(f.ket)[mi]).length;
      const d = vesselForms.filter(f=>sched(f.ket)[mi] && lookupNorm[normCode(f.code)]?.[m]==="C").length;
      return{total:expected,done:d,pct:expected?Math.round(d/expected*100):null};
    });
    return{vessel:v,total,done,pct,months,picScores:calcPIC(vRows, summaryMonth, v)};
  });
  const cs=p=>{
    if(p===null) return{color:"#d1d5db"};
    if(p===100)  return{background:"#bbf7d0",color:"#14532d",fontWeight:700};
    if(p>=80)    return{background:"#fef9c3",color:"#713f12",fontWeight:600};
    if(p>0)      return{background:"#fee2e2",color:"#991b1b",fontWeight:600};
    return{background:"#f3f4f6",color:"#9ca3af"};
  };
  return <div>
    <div style={{padding:"12px 16px",background:"#f8fafc",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:11,fontWeight:600,color:"#475569"}}>Filter Bulan (Ringkasan):</span>
      <select 
        value={summaryMonth} 
        onChange={e=>setSummaryMonth(e.target.value)}
        style={{padding:"4px 8px", fontSize:11, borderRadius:4, border:"1px solid #cbd5e1", background:"#fff"}}
      >
        <option value="Semua">Semua Bulan (Tahunan)</option>
        {MO.map((mName, i) => <option key={i+1} value={i+1}>{mName}</option>)}
      </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,padding:16,background:"#f8fafc"}}>
      {stats.map(r=>(
        <div key={r.vessel} style={{background:"#fff",borderRadius:8,padding:"12px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.08)",border:"1px solid #e5e7eb"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>{r.vessel}</div>
          <div style={{fontSize:26,fontWeight:800,lineHeight:1,color:clr(r.pct)}}>{r.pct}%</div>
          <div style={{fontSize:10,color:"#94a3b8",marginBottom:8}}>{r.done}/{r.total} form</div>
          <Bar pct={r.pct}/>
          <div style={{marginTop:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
            {Object.entries(r.picScores).map(([role,s])=>(
              <div key={role} style={{background:bgc(s.pct),borderRadius:4,padding:"3px 5px",fontSize:10,display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"#374151",fontWeight:600}}>{role}</span>
                <span style={{color:clr(s.pct),fontWeight:700}}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div style={{padding:"0 16px",display:"flex",gap:4,borderBottom:"1px solid #e5e7eb",background:"#fff"}}>
      {[["bulan","📅 Per Bulan"],["pic","👤 Nilai PIC"]].map(([k,lbl])=>(
        <button key={k} onClick={()=>setView(k)} style={{padding:"8px 14px",fontSize:12,fontWeight:view===k?700:500,
          background:"none",border:"none",borderBottom:`3px solid ${view===k?"#1e40af":"transparent"}`,
          color:view===k?"#1e40af":"#6b7280",cursor:"pointer"}}>{lbl}</button>
      ))}
    </div>
    <div style={{overflowX:"auto",padding:"12px 16px 16px"}}>
      {view==="bulan"?(
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}>
          <thead>
            <tr style={{background:"#1e3a5f",color:"#fff"}}>
              <th style={{padding:"10px 14px",textAlign:"left",fontWeight:700,minWidth:100}}>Kapal</th>
              <th style={{padding:"10px 8px",textAlign:"center",minWidth:75,fontWeight:600}}>Total</th>
              {MO.map(mn=><th key={mn} style={{padding:"10px 6px",textAlign:"center",minWidth:50,fontWeight:600}}>{mn}</th>)}
            </tr>
          </thead>
          <tbody>
            {stats.map((r,i)=>(
              <tr key={r.vessel} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                <td style={{padding:"9px 14px",fontWeight:700,color:"#1e3a5f",borderBottom:"1px solid #e5e7eb"}}>{r.vessel}</td>
                <td style={{padding:"9px 8px",textAlign:"center",borderBottom:"1px solid #e5e7eb"}}>
                  <span style={{padding:"2px 10px",borderRadius:20,fontWeight:700,fontSize:12,background:bgc(r.pct),color:clr(r.pct)}}>{r.pct}%</span>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{r.done}/{r.total}</div>
                </td>
                {r.months.map((ms,mi)=>(
                  <td key={mi} style={{textAlign:"center",padding:"9px 4px",fontSize:12,
                    borderBottom:"1px solid #e5e7eb",borderLeft:"1px solid #e5e7eb",...cs(ms.pct)}}>
                    {ms.pct!==null?`${ms.pct}%`:"–"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ):(
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}>
          <thead>
            <tr style={{background:"#1e3a5f",color:"#fff"}}>
              <th style={{padding:"10px 14px",textAlign:"left",fontWeight:700,minWidth:100}}>Kapal</th>
              {["Master","CO","CE","2E"].map(role=>(
                <th key={role} style={{padding:"10px 12px",textAlign:"center",minWidth:120,fontWeight:600}}>
                  <div>{role}</div>
                  <div style={{fontSize:10,color:"#93c5fd",fontWeight:400,marginTop:2}}>
                    {role==="Master"?"Semua form":role==="CO"?"Form PIC=CO":role==="CE"?"Semua Engine":"Form PIC=2E"}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((r,i)=>(
              <tr key={r.vessel} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:"#1e3a5f",borderBottom:"1px solid #e5e7eb"}}>{r.vessel}</td>
                {Object.entries(r.picScores).map(([role,s])=>(
                  <td key={role} style={{padding:"10px 12px",textAlign:"center",borderBottom:"1px solid #e5e7eb",borderLeft:"1px solid #e5e7eb"}}>
                    <div style={{fontSize:20,fontWeight:800,color:clr(s.pct)}}>{s.pct}%</div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>{s.done}/{s.total} form</div>
                    <div style={{marginTop:4}}><Bar pct={s.pct}/></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>;
}


function CariLaporanView() {
  const [vessel, setVessel] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const VESSELS = [
    "Express Mas", "Mavendra Mas", "Prakarsa Mas", "Pratama Mas",
    "Semangat Mas", "Sahabat Mas", "Segoro Mas", "Selaras Mas"
  ];
  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const uploadUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_UPLOAD_URL) || "https://api.voyageportal.my.id";
  const baseUrl = uploadUrl.replace(/\/+$/, "");
  const url = new URL(baseUrl + "/list-laporan");
      if (vessel) url.searchParams.append("vessel", vessel);
      if (year) url.searchParams.append("year", year);
      if (month) url.searchParams.append("month", month);

      const res = await fetch(url, { headers: { "X-Token": "smk-laporan-2026" } });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal fetch");
      setResults(data.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (path) => {
    try {
      const uploadUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_UPLOAD_URL) || "https://api.voyageportal.my.id";
      const baseUrl = uploadUrl.replace(/\/+$/, "");
      const dlUrl = `${baseUrl}/download?path=${encodeURIComponent(path)}`;
      
      const res = await fetch(dlUrl, {
        headers: { "X-Token": "smk-laporan-2026" }
      });
      
      if (!res.ok) throw new Error("Gagal mengunduh PDF");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      // Auto-download using anchor tag to avoid popup blockers and save with original name
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || "laporan.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error download: " + e.message);
    }
  };

  return (
    <div style={{ padding: 20, background: "#fff", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e3a5f", margin: "0 0 20px 0" }}>🔍 Cari Laporan</h2>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select value={vessel} onChange={e => setVessel(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, flex: "1 1 120px", minWidth: 140 }}>
          <option value="">Semua Kapal</option>
          {VESSELS.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <input 
          type="number" 
          placeholder="Tahun (cth: 2026)" 
          value={year} 
          onChange={e => setYear(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, flex: "1 1 100px", minWidth: 100 }}
        />
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, flex: "1 1 120px", minWidth: 140 }}>
          <option value="">Semua Bulan</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button 
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", flex: "1 1 100%", minWidth: 100 }}
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 15 }}>Error: {error}</div>}

      <div style={{ background: "#f8fafc", padding: 15, borderRadius: 6, border: "1px solid #e2e8f0" }}>
        {results.length === 0 && !loading ? (
          <div style={{ textAlign: "center", color: "#64748b", padding: 20 }}>Tidak ada laporan ditemukan.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.map((file, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, padding: "12px 0", borderBottom: i === results.length - 1 ? "none" : "1px solid #e2e8f0" }}>
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <div style={{ fontWeight: "bold", color: "#334155", wordBreak: "break-word", lineHeight: 1.4 }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{file.vessel} • {file.month} {file.year} • {(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button 
                  onClick={() => handleDownload(file.path)}
                  style={{ padding: "8px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold", fontSize: 12, whiteSpace: "nowrap" }}
                >
                  ⬇️ Download
                </button>
              </li>
            ))}
          </ul>
        )}
            </div>
    </div>
  );
}

function NeedApprovalView({ onApproveSuccess, approverEmail, isAdmin, isSuperintendent, userVessel, siVessels }) {
  const [loading, setLoading] = useState(true);
  const [filesByVessel, setFilesByVessel] = useState({});
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [sigPreview, setSigPreview] = useState(null);   // preview b64
  const [sigStatus, setSigStatus] = useState("");       // pesan simpan TTD
  const [showSigPanel, setShowSigPanel] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const uploadUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_UPLOAD_URL) || "https://api.voyageportal.my.id";
  const baseUrl = uploadUrl.replace(/\/+$/, "");

  // Load TTD yang sudah tersimpan
  useEffect(() => {
    if (!approverEmail || !isAdmin) return;
    fetch(`${baseUrl}/get-signature?email=${encodeURIComponent(approverEmail)}`, {
      headers: { "X-Token": "smk-laporan-2026" }
    }).then(r => r.json()).then(res => {
      if (res.ok && res.signature_b64) {
        setSigPreview("data:image/png;base64," + res.signature_b64);
      }
    }).catch(() => {});
  }, [approverEmail, baseUrl, isAdmin]);

  const handleSigUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target.result; // data:image/png;base64,...
      setSigPreview(b64);
      setSigStatus("Menyimpan TTD...");
      try {
        const res = await fetch(`${baseUrl}/save-signature`, {
          method: "POST",
          headers: {
            "X-Token": "smk-laporan-2026",
            "X-Email": approverEmail,
            "Content-Type": "text/plain"
          },
          body: b64
        });
        const result = await res.json();
        setSigStatus(result.ok ? "✓ TTD berhasil disimpan!" : "✗ Gagal: " + result.error);
        setTimeout(() => setSigStatus(""), 3000);
      } catch(err) {
        setSigStatus("✗ Error: " + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/list-need-approval`, {
        headers: { "X-Token": "smk-laporan-2026" }
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error || "Gagal memuat daftar");
      setFilesByVessel(result.data || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleApprove = async (vessel, file) => {
    if (!isAdmin) return; // double check
    setLoading(true);
    try {
      const emailParam = approverEmail ? `&email=${encodeURIComponent(approverEmail)}` : "";
      const res = await fetch(`${baseUrl}/approve?path=${encodeURIComponent(file.path)}${emailParam}`, {
        headers: { "X-Token": "smk-laporan-2026" }
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error || "Gagal approve");

      // Update rekap SMK ke "C" setelah approve
      try {
        // Ekstrak form code dari nama file (misal: 059-A_Lashing_... -> 059-A)
        const codeMatch = file.name.match(/^(\d{3}[-\s]?[A-Za-z]?)/);
        const formCode = codeMatch ? codeMatch[1].replace(/_/g, " ").trim() : "";
        // Ekstrak bulan dari path (misal: .../2026/Agustus/file.pdf)
        const pathParts = file.path.split("/");
        const monthName = pathParts.length >= 4 ? pathParts[pathParts.length - 2] : "";
        const yearStr = pathParts.length >= 4 ? pathParts[pathParts.length - 3] : "";
        const dateStr = monthName && yearStr ? `${yearStr}/${monthName}` : "";
        
        // Nama vessel dari folder (misal: Express_Mas -> Express Mas)
        const vesselName = vessel.replace(/_/g, " ");
        
        await markFormCompleted(supabase, {
          vessel: vesselName,
          formCode: formCode,
          dateStr: dateStr,
        });
        
        setSuccessMsg("Approval sukses!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (e) {
        console.warn("[Approve] Rekap update failed:", e.message);
        alert(`File di-approve, TAPI gagal update rekap:\n${e.message}`);
      }

      await fetchFiles();
      if (onApproveSuccess) onApproveSuccess();
    } catch (err) {
      alert("Gagal approve file: " + err.message);
      setLoading(false);
    }
  };

  const handleReject = (vessel, file) => {
    if (!isAdmin) return;
    setRejectTarget({ vessel, file });
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const { vessel, file } = rejectTarget;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/reject?path=${encodeURIComponent(file.path)}`, {
        headers: { "X-Token": "smk-laporan-2026" }
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error || "Gagal reject");

      setSuccessMsg("Laporan berhasil ditolak!");
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchFiles();
    } catch (err) {
      alert("Gagal reject file: " + err.message);
    } finally {
      setLoading(false);
      setRejectTarget(null);
    }
  };

  const handleView = async (vessel, file) => {
    try {
      const dlUrl = `${baseUrl}/download?path=${encodeURIComponent(file.path)}`;
      const dlRes = await fetch(dlUrl, {
        headers: { "X-Token": "smk-laporan-2026" }
      });
      if (dlRes.ok) {
        const blob = await dlRes.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (e) {
      alert("Gagal membuka file: " + e.message);
    }
  };

  if (loading && Object.keys(filesByVessel).length === 0) return <div style={{padding: 20}}>Memuat daftar file...</div>;
  if (error) return <div style={{padding: 20, color: "red"}}>Error: {error}</div>;

  // Filter based on user vessel if applicable
  let displayEntries = Object.entries(filesByVessel);
  if (userVessel) {
    const vesselQuery = userVessel.toLowerCase().replace(/_/g, " ").trim();
    displayEntries = displayEntries.filter(([v]) => v.toLowerCase().replace(/_/g, " ").trim() === vesselQuery);
  } else if (isSuperintendent) {
    if (siVessels && siVessels.length > 0) {
      const allowed = siVessels.map(v => v.toLowerCase().replace(/_/g, " ").trim());
      displayEntries = displayEntries.filter(([v]) => allowed.includes(v.toLowerCase().replace(/_/g, " ").trim()));
    } else {
      // SI doesn't have any assigned ships yet
      displayEntries = [];
    }
  }

  return (
    <div style={{padding: 20, background: "#f8fafc", position: "relative"}}>
      {successMsg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div role="status" style={{ padding: "20px 32px", borderRadius: 12, background: "#dcfce7", border: "2px solid #4ade80", color: "#166534", fontWeight: 800, fontSize: 18, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            ✓ {successMsg}
          </div>
        </div>
      )}
      {rejectTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, width: "90%", maxWidth: 400, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#fee2e2", padding: "8px 12px", borderRadius: "50%", fontSize: 20 }}>
                ⚠️
              </div>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>Tolak Laporan?</h3>
            </div>
            <p style={{ color: "#475569", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menolak dan menghapus file <br/><strong>{rejectTarget.file.name}</strong>?<br/><br/>
              Laporan ini akan dihapus permanen dari daftar persetujuan.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setRejectTarget(null)} style={{ padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Batal</button>
              <button onClick={confirmReject} style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Ya, Tolak & Hapus</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
        <h2 style={{fontSize: 18, fontWeight: 800, color: "#1e3a5f", margin: 0}}>📋 Menunggu Persetujuan (Need Approval)</h2>
        <div style={{display:"flex", gap:8}}>
          {isAdmin && (
            <button onClick={() => setShowSigPanel(p=>!p)} style={{padding: "6px 12px", fontSize: 12, borderRadius: 4, border: "1px solid #3b82f6", background: sigPreview?"#eff6ff":"#fff", color:"#1d4ed8", cursor: "pointer", fontWeight:600}}>
              ✍️ {sigPreview ? "Ubah TTD" : "Atur TTD Saya"}
            </button>
          )}
          <button onClick={fetchFiles} style={{padding: "6px 12px", fontSize: 12, borderRadius: 4, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer"}}>↻ Refresh</button>
        </div>
      </div>

      {isAdmin && showSigPanel && (
        <div style={{background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:16, marginBottom:16}}>
          <div style={{fontSize:13, fontWeight:700, color:"#1e40af", marginBottom:8}}>✍️ Tanda Tangan Digital Saya ({approverEmail})</div>
          <div style={{fontSize:12, color:"#64748b", marginBottom:12}}>
            Upload foto TTD Anda (PNG/JPG, background putih/transparan). TTD akan otomatis ditempel di PDF setiap kali Anda meng-Approve laporan.
          </div>
          <div style={{display:"flex", alignItems:"center", gap:16, flexWrap:"wrap"}}>
            {sigPreview && (
              <div style={{border:"1px solid #93c5fd", borderRadius:6, padding:4, background:"#fff"}}>
                <img src={sigPreview} alt="TTD" style={{height:70, maxWidth:200, objectFit:"contain", display:"block"}}/>
              </div>
            )}
            <label style={{cursor:"pointer", padding:"8px 14px", background:"#2563eb", color:"#fff", borderRadius:6, fontWeight:600, fontSize:12}}>
              {sigPreview ? "Ganti TTD" : "Upload TTD"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleSigUpload}/>
            </label>
            {sigStatus && <span style={{fontSize:12, color: sigStatus.startsWith("✓")?"#16a34a":"#dc2626", fontWeight:600}}>{sigStatus}</span>}
          </div>
        </div>
      )}

      {displayEntries.length === 0 ? (
        <div style={{padding: 20, background: "#fff", borderRadius: 8, textAlign: "center", color: "#64748b", border: "1px dashed #cbd5e1"}}>
          Tidak ada laporan yang menunggu persetujuan.
        </div>
      ) : (
        displayEntries.map(([vessel, files]) => (
          <div key={vessel} style={{background: "#fff", borderRadius: 8, padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb"}}>
            <h3 style={{fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#334155", display: "flex", alignItems: "center", gap: 8}}>
              🚢 {vessel.replace(/_/g, " ").toUpperCase()} <span style={{fontSize: 12, fontWeight: 500, color: "#94a3b8", background: "#f1f5f9", padding: "2px 6px", borderRadius: 12}}>{files.length} file</span>
            </h3>
            <div style={{overflowX: "auto"}}>
              <table style={{width: "100%", borderCollapse: "collapse", fontSize: 13}}>
                <thead>
                  <tr style={{textAlign: "left", color: "#64748b", background: "#f8fafc"}}>
                    <th style={{padding: "8px 12px", borderBottom: "2px solid #e2e8f0"}}>Nama File</th>
                    <th style={{padding: "8px 12px", borderBottom: "2px solid #e2e8f0", width: 140}}>Tanggal Upload</th>
                    <th style={{padding: "8px 12px", borderBottom: "2px solid #e2e8f0", width: 160}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f.name} style={{borderBottom: "1px solid #f1f5f9"}}>
                      <td style={{padding: "10px 12px", color: "#1e40af", fontWeight: 600}}>{f.name}</td>
                      <td style={{padding: "10px 12px", color: "#64748b"}}>{new Date(f.created_at).toLocaleString('id-ID')}</td>
                      <td style={{padding: "10px 12px", display: "flex", gap: 8}}>
                        <button onClick={() => handleView(vessel, f)} style={{padding: "5px 10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "#334155", fontWeight: 500}}>Lihat</button>
                        {isAdmin && (
                          <>
                            <button onClick={() => handleApprove(vessel, f)} style={{padding: "5px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600}}>✓ Approve</button>
                            <button onClick={() => handleReject(vessel, f)} style={{padding: "5px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600}}>❌ Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
export default function SMKRekap(){
  const [active,setActive]=useState("Semua");
  const [year,setYear]=useState(CURRENT_YEAR);
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [adminEmail,setAdminEmail]=useState("");
  const [userRole, setUserRole] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [checkingAdmin,setCheckingAdmin]=useState(true);
  const [lastUpd,setLastUpd]=useState(null);
  const [siVessels, setSiVessels] = useState([]);

  const fetchData=useCallback(async ()=>{
    try {
      const {data:all,error:err}=await supabase
        .from('smk_rekap')
        .select('*')
        .eq('year',year)
        .limit(10000);
      if(err){ setError(err.message); setLoading(false); return; }
      if(all?.length){
        setData(all.map(r=>({...r, code: r.form_code})));
        const max=Math.max(...all.map(r=>new Date(r.updated_at||0).getTime()));
        setLastUpd(max>0 ? new Date(max) : null);
        setError(null);
      } else {
        setData([]);
        setError(null);
      }
    } catch(e){
      // Network/CORS transient — jangan full-screen error, biar retry via realtime
      console.warn("Rekap fetch transient:", e?.message);
      setError(null);
    }
    setLoading(false);
  },[year]);

  const isAdmin = userRole === "admin" || (adminEmail?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase());
  const isSuperintendent = userRole === "superintendent" || userRole === "supruntendent" || userRole === "si";
  const canApprove = isAdmin || isSuperintendent;

  const userVessel = useMemo(() => {
    if (userRole !== "kapal" && userRole !== "ship") return null;
    if (!userProfile) return null;
    const candidates = [userProfile.ship, userProfile.name, userProfile.full_name, adminEmail?.split("@")[0]];
    for (const c of candidates) {
      if (c && typeof c === "string" && c.trim()) return c.trim();
    }
    return null;
  }, [userRole, userProfile, adminEmail]);

  useEffect(() => {
    if (isSuperintendent && adminEmail) {
      supabase.from('ships').select('vessel_name').eq('superintendent', adminEmail)
        .then(({ data }) => {
          if (data) setSiVessels(data.map(d => d.vessel_name));
        });
    } else {
      setSiVessels([]);
    }
  }, [isSuperintendent, adminEmail]);

  useEffect(()=>{
    fetchData();
    const channel = supabase.channel("smk_rekap_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"smk_rekap"},fetchData)
      .subscribe();
    return ()=> supabase.removeChannel(channel);
  },[fetchData]);

  useEffect(()=>{
    const loadUser = async () => {
      const { data:{ session } } = await supabase.auth.getSession();
      const email = session?.user?.email || "";
      setAdminEmail(email);
      if (session?.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUserRole(profile.role ? profile.role.toLowerCase() : "");
          setUserProfile(profile);
        }
      }
      setCheckingAdmin(false);
    };
    loadUser();
    
    // Auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAdminEmail(session.user.email);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUserRole(profile.role ? profile.role.toLowerCase() : "");
          setUserProfile(profile);
        }
      } else {
        setAdminEmail("");
        setUserRole("");
        setUserProfile(null);
      }
    });

    return ()=> authListener.subscription.unsubscribe();
  },[]);

  const total=data.length, done=data.filter(d=>d.status==="C").length;
  const pctAll=total?Math.round(done/total*100):0;

  const handleToggle=useCallback(async ({vessel,code,month})=>{
    const row = data.find(r=>r.vessel===vessel && r.form_code===code && r.month===month);
    const next = (row && row.status==="C") ? "S" : "C";
    
    // Optimistic UI Update (Langsung ubah state biar cepat di layar HP)
    if(row) {
      setData(prev=>prev.map(r=>r.vessel===vessel && r.form_code===code && r.month===month ? {...r,status:next} : r));
    } else {
      // Pastikan property 'code' dan 'form_code' dua-duanya ada
      setData(prev=>[...prev, { vessel, form_code: code, code: code, month, year, status: next }]);
    }

    // Panggil database di background (Tidak usah ditunggu UI-nya)
    supabase.from("smk_rekap")
      .upsert({ vessel, form_code: code, month, year, status: next, updated_at: new Date().toISOString() }, { onConflict: "vessel,form_code,year,month" })
      .then(({error}) => {
        if(error) {
          console.error("Gagal update toggle:", error);
          // Opsi: Jika gagal banget, kita bisa kembalikan state. 
          // Tapi untuk log SMK, biarkan saja atau set error banner.
          setError("Gagal menyimpan perubahan " + code + " ke database.");
        }
      });
  },[data, year]);

  return(
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0f4f8",minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {error && (
        <div style={{background:"#fee2e2",color:"#991b1b",padding:"10px 16px",fontSize:12,borderBottom:"1px solid #fecaca"}}>
          Rekap gagal: {error}
        </div>
      )}

      {/* Top bar */}
      <div style={{background:"#0f1f3d",color:"#fff",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:16,fontWeight:800}}>📋 <span style={{color:"#60a5fa"}}>REKAP</span> LAPORAN SMK</div>
          <div style={{fontSize:11,color:"#475569",marginTop:2}}>Sistem Manajemen Keselamatan</div>
        </div>

        {/* Dropdown tahun */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"#94a3b8"}}>Tahun:</span>
          <select value={year} onChange={e=>{setYear(+e.target.value);setActive("Semua");}}
            style={{padding:"6px 12px",fontSize:14,fontWeight:700,border:"2px solid #334155",
              borderRadius:6,background:"#1e293b",color:"#fff",cursor:"pointer",outline:"none",
              appearance:"auto"}}>
            {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          {[
            {l:"Progress",   v:`${pctAll}%`,  c:"#34d399"},
            {l:"Selesai",    v:done,           c:"#60a5fa"},
            {l:"Pending",    v:total-done,     c:"#fb923c"},

          ].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:10,color:"#64748b",marginTop:2,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"2px solid #e2e8f0",display:"flex",overflowX:"auto",padding:"0 12px"}}>
        {["Semua",...VESSELS,"Need Approval","Cari Laporan"].map(v=>(
          <button key={v} onClick={()=>setActive(v)}
            style={{padding:"11px 14px",fontSize:12,fontWeight:active===v?700:500,
              color:active===v?"#1e40af":"#6b7280",background:"none",border:"none",
              borderBottom:`3px solid ${active===v?"#1e40af":"transparent"}`,
              cursor:"pointer",whiteSpace:"nowrap"}}>
            {v==="Semua"?"📊 Semua Kapal":v==="Need Approval"?"⏳ Need Approval":v==="Cari Laporan"?"🔍 Cari Laporan":v}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{padding:"7px 20px",background:"#fff",borderBottom:"1px solid #e5e7eb",display:"flex",gap:16,fontSize:11,flexWrap:"wrap",alignItems:"center"}}>
        {[["#bbf7d0","#14532d","C = Completed"],["#fef9c3","#713f12","S = Scheduled"],["#fce7f3","#dc2626","X = Tidak dijadwalkan"]].map(([b,f,lbl])=>(
          <div key={lbl} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:14,height:14,borderRadius:3,background:b,border:`1px solid ${f}44`}}/>
            <span style={{color:"#374151"}}>{lbl}</span>
          </div>
        ))}
        <div style={{marginLeft:"auto",color:"#94a3b8",fontSize:10}}>Tahun aktif: {year}</div>
      </div>

      {/* Content */}
      <div style={{flex:1,padding:16}}>
        <div style={{background:"#fff",borderRadius:10,boxShadow:"0 1px 4px rgba(0,0,0,.08)",overflow:"hidden"}}>
          {active === "Cari Laporan" ? <CariLaporanView /> : active === "Need Approval" ? (
            <NeedApprovalView onApproveSuccess={fetchData} approverEmail={adminEmail} isAdmin={canApprove} isSuperintendent={isSuperintendent} userVessel={userVessel} siVessels={siVessels} />
          ) : active === "Semua" ? (
            <SummaryView data={data} />
          ) : (
            <VesselTable vessel={active} data={data} isAdmin={isAdmin} onToggle={handleToggle} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Export helper untuk auto-update dari handleSavePdf ─────────────────────────
export async function markFormCompleted(supabaseClient, { vessel, formCode, dateStr }){
  const matchedVessel = VESSELS.find(v => (vessel||"").toUpperCase().includes(v.toUpperCase())) || null;
  if(!matchedVessel){
    console.warn("[SMK Rekap] Vessel tidak dikenali:", vessel);
    return;
  }
  
  // Normalisasi kode form agar cocok dengan grid (misal "059-A" atau "059A" jadi "059 A")
  let cleanCode = (formCode || "").replace(/[\s-]/g, "").toUpperCase();
  const matchedForm = FORMS.find(f => f.code.replace(/[\s-]/g, "").toUpperCase() === cleanCode);
  const finalFormCode = matchedForm ? matchedForm.code : formCode.trim();
  const raw = dateStr||"";
  let year = CURRENT_YEAR, month = null;
  const yearMatch = raw.match(/(\d{4})/);
  if(yearMatch) year = parseInt(yearMatch[1], 10);
  
  let m = raw.match(/(\d{4})[\/\-](\d{1,2})/);
  if(m){ month = +m[2]; }
  else{
    m = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if(m){ month = +m[2]; }
  }
  if(!month){
    const indonesianMonths = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];
    const englishMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    
    let idx = indonesianMonths.findIndex(mn => raw.toLowerCase().includes(mn));
    if(idx < 0) idx = englishMonths.findIndex(mn => raw.toLowerCase().includes(mn));
    
    if(idx>=0) month = idx+1;
  }
  if(!month){
    console.warn("[SMK Rekap] Tarikh tidak valid:", dateStr);
    return;
  }
  const { error } = await supabaseClient
    .from("smk_rekap")
    .upsert({
      vessel: matchedVessel,
      form_code: finalFormCode,
      year,
      month,
      status: "C",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },{ onConflict: "vessel,form_code,year,month" });
  if(error) {
    console.error("[SMK Rekap] Gagal update:", error);
    throw error;
  }
  else {
    console.log(`[SMK Rekap] ✓ ${matchedVessel} | Form ${finalFormCode} | ${month}/${year} → C`);
  }
}
