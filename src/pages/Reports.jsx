import React, { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Header, Seg } from '../components/ui.jsx'
import { HistoryChart } from '../components/Charts.jsx'
import { plots, seriesFor } from '../data/mock.js'

export default function Reports(){
  const [plot,setPlot]=useState('t01')
  const [range,setRange]=useState('30d')
  const [vars,setVars]=useState({moisture:true,temp:true})
  const [cmp,setCmp]=useState(false)
  const data=seriesFor(plot,range)
  const csv=()=>{
    const rows=['periodo;umidade_pct;temp_c',...data.map(d=>`${d.t};${d.moisture};${d.temp}`)].join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows],{type:'text/csv'}));a.download=`vinhasense_${plot}_${range}.csv`;a.click()
  }
  return (
    <>
      <Header title="Relatórios" sub="Escolha safra, período e variáveis">
        <button className="btn" onClick={csv}><Download size={17}/>CSV</button>
        <button className="btn primary" onClick={()=>window.print()}><FileText size={17}/>PDF</button>
      </Header>
      <div className="card row wrap mb" style={{gap:18}}>
        <select className="input" style={{width:220}} value={plot} onChange={e=>setPlot(e.target.value)} aria-label="Safra">{plots.map(p=><option key={p.id} value={p.id}>{p.name} — {p.variety}</option>)}</select>
        <Seg value={range} onChange={setRange} options={['24h','7d','30d']}/>
        <label className="row"><input type="checkbox" checked={vars.moisture} onChange={e=>setVars({...vars,moisture:e.target.checked})}/>Umidade</label>
        <label className="row"><input type="checkbox" checked={vars.temp} onChange={e=>setVars({...vars,temp:e.target.checked})}/>Temperatura</label>
        <label className="row"><input type="checkbox" checked={cmp} onChange={e=>setCmp(e.target.checked)}/>Comparar com safra anterior</label>
      </div>
      <div className="card"><HistoryChart data={data} height={320}/></div>
      {cmp&&<div className="card mt"><h2 className="mb">Safra atual × safra anterior</h2>
        <table><thead><tr><th>Indicador</th><th>Safra atual</th><th>Safra anterior</th><th>Variação</th></tr></thead><tbody>
          <tr><td>Umidade média</td><td>26,4%</td><td>24,9%</td><td>+1,5 p.p.</td></tr>
          <tr><td>Temp. média do solo</td><td>31,0 °C</td><td>30,2 °C</td><td>+0,8 °C</td></tr>
          <tr><td>Horas fora da faixa</td><td>38 h</td><td>61 h</td><td>−23 h</td></tr></tbody></table></div>}
      <div className="card mt table-wrap"><h2 className="mb">Prévia dos dados</h2>
        <table><thead><tr><th>Período</th>{vars.moisture&&<th>Umidade (%)</th>}{vars.temp&&<th>Temp. (°C)</th>}</tr></thead>
          <tbody>{data.slice(0,8).map((d,i)=><tr key={i}><td>{d.t}</td>{vars.moisture&&<td>{d.moisture}</td>}{vars.temp&&<td>{d.temp}</td>}</tr>)}</tbody></table></div>
    </>
  )
}
