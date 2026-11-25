import React, { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Header, Seg } from '../components/ui.jsx'
import { HistoryChart } from '../components/Charts.jsx'
import { useData } from '../data.jsx'
import { useSerie } from '../lib/hooks.js'
import { fmt } from '../lib/derive.js'

export default function Reports(){
  const { safras } = useData()
  const [plot,setPlot]=useState('')   // '' = todos os meus sensores
  const [range,setRange]=useState('30d')
  const [vars,setVars]=useState({moisture:true,temp:true,air:true})
  const s=safras.find(x=>x._id===plot)
  const { rows, loading } = useSerie(s?.canalId||'',range)
  const csv=()=>{
    const linhas=['data_hora;umidade_solo_pct;temperatura_c;umidade_ar_pct',...rows.map(d=>[new Date(d.ts).toISOString(),d.moisture??'',d.temp??'',d.air??''].join(';'))].join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([linhas],{type:'text/csv'}));a.download=`vinhasense_${(s?.nome||'todos').replace(/\W+/g,'_')}_${range}.csv`;a.click()
  }
  return (
    <>
      <Header title="Relatórios" sub="Médias por hora (24h e 7d) ou por dia (30d), direto do banco de leituras">
        <button className="btn" onClick={csv} disabled={!rows.length}><Download size={17}/>CSV</button>
        <button className="btn primary" onClick={()=>window.print()}><FileText size={17}/>PDF</button>
      </Header>
      <div className="card row wrap mb" style={{gap:18}}>
        <select className="input" style={{width:240}} value={plot} onChange={e=>setPlot(e.target.value)} aria-label="Safra">
          <option value="">Todos os meus sensores</option>
          {safras.map(p=><option key={p._id} value={p._id}>{p.nome} — {p.variedade}</option>)}</select>
        <Seg value={range} onChange={setRange} options={['24h','7d','30d']}/>
        <label className="row"><input type="checkbox" checked={vars.moisture} onChange={e=>setVars({...vars,moisture:e.target.checked})}/>Umidade do solo</label>
        <label className="row"><input type="checkbox" checked={vars.temp} onChange={e=>setVars({...vars,temp:e.target.checked})}/>Temperatura</label>
        <label className="row"><input type="checkbox" checked={vars.air} onChange={e=>setVars({...vars,air:e.target.checked})}/>Umidade do ar</label>
      </div>
      <div className="card">{loading?<div className="skeleton" style={{height:300}}/>:<HistoryChart data={rows} show={vars} height={320}/>}</div>
      <div className="card mt table-wrap"><h2 className="mb">Prévia dos dados</h2>
        {rows.length===0?<div className="empty">Sem leituras neste período.</div>:
        <table><thead><tr><th>Período</th>{vars.moisture&&<th>Umidade solo (%)</th>}{vars.temp&&<th>Temp. (°C)</th>}{vars.air&&<th>Umidade ar (%)</th>}</tr></thead>
          <tbody>{rows.slice(-8).reverse().map((d,i)=><tr key={i}><td>{d.t}</td>{vars.moisture&&<td>{fmt(d.moisture)}</td>}{vars.temp&&<td>{fmt(d.temp)}</td>}{vars.air&&<td>{fmt(d.air)}</td>}</tr>)}</tbody></table>}
        {rows.length>8&&<div className="muted" style={{fontSize:12.5,marginTop:8}}>Mostrando os 8 períodos mais recentes de {rows.length}. O CSV traz todos.</div>}
      </div>
    </>
  )
}
