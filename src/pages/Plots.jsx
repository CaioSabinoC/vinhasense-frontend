import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Rows3, Plus } from 'lucide-react'
import { Header, Chip, fmt } from '../components/ui.jsx'
import { Spark } from '../components/Charts.jsx'
import { plots, seriesFor, fmtKg } from '../data/mock.js'

export default function Plots(){
  const [view,setView]=useState('cards')
  const nav=useNavigate()
  return (
    <>
      <Header title="Safras" sub={`${plots.length} safras cadastrados`}>
        <div className="seg">
          <button className={view==='cards'?'on':''} onClick={()=>setView('cards')} aria-label="Cartões"><LayoutGrid size={16}/></button>
          <button className={view==='table'?'on':''} onClick={()=>setView('table')} aria-label="Tabela"><Rows3 size={16}/></button>
        </div>
        <Link to="/sensores/novo" className="btn primary"><Plus size={18}/>Adicionar sensor</Link>
      </Header>
      {view==='cards'?(
        <div className="grid g3">
          {plots.map(p=>(
            <Link to={`/safras/${p.id}`} className="card" key={p.id}>
              <div className="row between"><h2>{p.name}</h2><Chip s={p.status}/></div>
              <div className="sub">{p.variety} · {p.sensors.length} sensor(es)</div>
              <div className="row mt" style={{gap:28}}>
                <div><div className="muted" style={{fontSize:12.5}}>Umidade</div><b style={{fontSize:26}}>{fmt(p.moisture)}{p.moisture!=null&&'%'}</b></div>
                <div><div className="muted" style={{fontSize:12.5}}>Temp. solo</div><b style={{fontSize:26}}>{fmt(p.temp)}{p.temp!=null&&' °C'}</b></div>
              </div>
              <div className="mt"><div className="muted" style={{fontSize:12.5}}>Previsão de colheita</div><b style={{fontSize:20}}>{fmtKg(p.forecastKg)} kg</b></div>
              <div className="mt">{p.status==='off'?<div className="skeleton" style={{height:36}}/>:<Spark data={seriesFor(p.id,'24h')}/>}</div>
            </Link>))}
        </div>
      ):(
        <div className="card table-wrap"><table>
          <thead><tr><th>Safra</th><th>Variedade</th><th>Sensores</th><th>Umidade</th><th>Temp. solo</th><th>Previsão (kg)</th><th>Status</th></tr></thead>
          <tbody>{plots.map(p=>(
            <tr key={p.id} className="click" onClick={()=>nav(`/safras/${p.id}`)}>
              <td><b>{p.name}</b></td><td>{p.variety}</td><td>{p.sensors.length}</td>
              <td>{fmt(p.moisture)}{p.moisture!=null&&'%'}</td><td>{fmt(p.temp)}{p.temp!=null&&' °C'}</td><td>{fmtKg(p.forecastKg)}</td><td><Chip s={p.status}/></td></tr>))}
          </tbody></table></div>
      )}
    </>
  )
}
