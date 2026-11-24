import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Droplets, Thermometer, Sprout, Scale } from 'lucide-react'
import { Header, Stat, Chip, Seg, fmt } from '../components/ui.jsx'
import { HistoryChart } from '../components/Charts.jsx'
import { plotById, sensors, seriesFor, fmtKg } from '../data/mock.js'
import { useThresholds } from '../App.jsx'

export default function PlotDetail(){
  const { id }=useParams()
  const p=plotById(id)
  const { th }=useThresholds()
  const [range,setRange]=useState('7d')
  const [irrig,setIrrig]=useState(true)
  const [notes,setNotes]=useState([{d:'28/09',t:'Irrigação estendida em 20 min após calor intenso.'},{d:'21/09',t:'Poda verde concluída.'}])
  const [draft,setDraft]=useState('')
  if(!p) return <div className="empty">Safra não encontrada. <Link to="/safras">Voltar</Link></div>
  const mine=sensors.filter(s=>s.plot===p.id)
  const offline=p.status==='off'
  return (
    <>
      <Header title={`${p.name} — ${p.variety}`} sub={`Porta-enxerto ${p.rootstock} · plantio ${new Date(p.planted).toLocaleDateString('pt-BR')}`}>
        <span className="chip beta"><Sprout size={14}/>Fase: {p.stage}</span><Chip s={p.status}/>
      </Header>

      <div className="grid g3">
        <Stat icon={Droplets} label="Umidade do solo agora" value={fmt(p.moisture)} unit={p.moisture!=null?'%':''} note={`faixa definida: ${th.mMin}–${th.mMax}%`}/>
        <Stat icon={Thermometer} label="Temperatura do solo agora" value={fmt(p.temp)} unit={p.temp!=null?'°C':''} note={`faixa definida: ${th.tMin}–${th.tMax} °C`}/>
        <Stat icon={Scale} label="Previsão de colheita" value={fmtKg(p.forecastKg)} unit="kg" note={`~ ${new Date(p.harvestDate).toLocaleDateString('pt-BR')} · ${fmtKg(p.forecastKg/p.areaHa)} kg/ha · confiança ${p.confidence.toLowerCase()}`}/>
      </div>
      <div className="notice mt" style={{alignItems:'center'}}>As faixas são definidas por você para esta safra. O VinhaSense não assume valores ideais universais.</div>

      <div className="card mt">
        <div className="row between wrap mb">
          <h2>Histórico</h2>
          <div className="row wrap">
            <label className="row muted" style={{fontSize:13.5}}><input type="checkbox" checked={irrig} onChange={e=>setIrrig(e.target.checked)}/>Eventos de irrigação</label>
            <Seg value={range} onChange={setRange} options={['24h','7d','30d']}/>
          </div>
        </div>
        {offline?<div className="empty">Sensor offline — sem leituras recentes.</div>:<HistoryChart data={seriesFor(p.id,range)} th={th} showIrrigation={irrig} height={320}/>}
      </div>

      <div className="grid g2 stack mt">
        <div className="card table-wrap">
          <h2 className="mb">Sensores</h2>
          <table><thead><tr><th>Dispositivo</th><th>Prof.</th><th>Bateria</th><th>Última leitura</th></tr></thead>
          <tbody>{mine.map(s=>(
            <tr key={s.id} className="click" onClick={()=>location.hash=`#/sensores/${s.id}`}>
              <td><b>{s.device}</b><div><Chip s={s.status}/></div></td><td>{s.depth}</td>
              <td><span className="battery"><i style={{width:s.battery+'%',background:s.battery<25?'var(--red)':undefined}}/></span> {s.battery}%</td><td>{s.last}</td></tr>))}</tbody></table>
        </div>
        <div className="card">
          <h2 className="mb">Anotações do produtor</h2>
          <textarea className="input" placeholder="Ex.: ajustei o turno de rega…" value={draft} onChange={e=>setDraft(e.target.value)}/>
          <button className="btn primary sm mt" onClick={()=>{if(draft.trim()){setNotes([{d:'hoje',t:draft},...notes]);setDraft('')}}}>Salvar anotação</button>
          {notes.map((n,i)=><div className="list-item" key={i}><b style={{minWidth:50}}>{n.d}</b><span>{n.t}</span></div>)}
        </div>
      </div>
    </>
  )
}
