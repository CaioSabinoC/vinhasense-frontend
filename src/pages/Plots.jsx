import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Rows3, Plus } from 'lucide-react'
import { Header, Chip, ErrorBanner } from '../components/ui.jsx'
import { Spark } from '../components/Charts.jsx'
import { Onboarding } from './Dashboard.jsx'
import { useData } from '../data.jsx'
import { useSerie } from '../lib/hooks.js'
import { useThresholds } from '../settings.jsx'
import { fmt, fmtKg, fmtDate, timeAgo, leituraDaSafra, statusDaSafra, canaisDaSafra } from '../lib/derive.js'

function PlotSpark({ canalId }){
  const { rows } = useSerie(canalId, '24h')
  if(!rows.length) return <div className="muted" style={{fontSize:12.5}}>Sem leituras nas últimas 24 h</div>
  return <Spark data={rows}/>
}

export default function Plots(){
  const [view,setView]=useState('cards')
  const nav=useNavigate()
  const { th } = useThresholds()
  const { safras, dispositivos, ultimas, loading, error, reload } = useData()
  const info = s => {
    const l = leituraDaSafra(s,dispositivos,ultimas)
    return { l, st: statusDaSafra(s,dispositivos,ultimas,th), n: dispositivos.filter(d=>canaisDaSafra(s,dispositivos).includes(d.canalId)).length, kg: s.previsao?.kgEstimado ?? s.previsao?.kgReal }
  }
  return (
    <>
      <Header title="Safras" sub={loading?'Carregando…':`${safras.length} safra(s) cadastrada(s)`}>
        <div className="seg">
          <button className={view==='cards'?'on':''} onClick={()=>setView('cards')} aria-label="Cartões"><LayoutGrid size={16}/></button>
          <button className={view==='table'?'on':''} onClick={()=>setView('table')} aria-label="Tabela"><Rows3 size={16}/></button>
        </div>
        <Link to="/sensores/novo" className="btn">Adicionar sensor</Link>
        <Link to="/safras/nova" className="btn primary"><Plus size={18}/>Nova safra</Link>
      </Header>
      <ErrorBanner error={error} onRetry={reload}/>
      {!loading && safras.length===0 && <Onboarding semSensor={dispositivos.length===0} semSafra={dispositivos.length>0}/>}
      {view==='cards'?(
        <div className="grid g3">
          {safras.map(s=>{ const {l,st,n,kg}=info(s); return (
            <Link to={`/safras/${s._id}`} className="card" key={s._id}>
              <div className="row between"><h2>{s.nome}</h2>{s.status==='encerrada'?<span className="chip off">Encerrada</span>:<Chip s={st}/>}</div>
              <div className="sub">{s.variedade} · {fmt(s.areaHa,2)} ha · {n} sensor(es)</div>
              <div className="row mt" style={{gap:28}}>
                <div><div className="muted" style={{fontSize:12.5}}>Umidade solo</div><b style={{fontSize:26}}>{fmt(l?.umidadeSolo)}{l?.umidadeSolo!=null&&'%'}</b></div>
                <div><div className="muted" style={{fontSize:12.5}}>Temperatura</div><b style={{fontSize:26}}>{fmt(l?.temperatura)}{l?.temperatura!=null&&' °C'}</b></div>
              </div>
              <div className="muted" style={{fontSize:12.5,marginTop:4}}>{l?`última leitura ${timeAgo(l.lidoEm)}`:'sem leituras'}</div>
              <div className="mt"><div className="muted" style={{fontSize:12.5}}>{s.status==='encerrada'?'Colheita real':'Previsão de colheita'}</div><b style={{fontSize:20}}>{kg!=null?`${fmtKg(kg)} kg`:'—'}</b></div>
              {s.status==='ativa'&&<div className="mt"><PlotSpark canalId={s.canalId||''}/></div>}
            </Link>)})}
        </div>
      ):(
        <div className="card table-wrap"><table>
          <thead><tr><th>Safra</th><th>Variedade</th><th>Poda</th><th>Sensores</th><th>Umidade solo</th><th>Temp.</th><th>Previsão (kg)</th><th>Status</th></tr></thead>
          <tbody>{safras.map(s=>{ const {l,st,n,kg}=info(s); return (
            <tr key={s._id} className="click" onClick={()=>nav(`/safras/${s._id}`)}>
              <td><b>{s.nome}</b></td><td>{s.variedade}</td><td>{fmtDate(s.dataPoda)}</td><td>{n}</td>
              <td>{fmt(l?.umidadeSolo)}{l?.umidadeSolo!=null&&'%'}</td><td>{fmt(l?.temperatura)}{l?.temperatura!=null&&' °C'}</td><td>{fmtKg(kg)}</td>
              <td>{s.status==='encerrada'?<span className="chip off">Encerrada</span>:<Chip s={st}/>}</td></tr>)})}
          </tbody></table></div>
      )}
    </>
  )
}
