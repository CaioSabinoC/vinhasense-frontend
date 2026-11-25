import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header, Chip, ErrorBanner } from '../components/ui.jsx'
import { useData } from '../data.jsx'
import { useThresholds } from '../settings.jsx'
import { derivarAlertas, timeAgo } from '../lib/derive.js'

export default function Alerts(){
  const [f,setF]=useState('todos')
  const { th } = useThresholds()
  const { safras, dispositivos, ultimas, loading, error, reload } = useData()
  const list=derivarAlertas(safras,dispositivos,ultimas,th)
  const filtros={todos:()=>true,críticos:a=>a.level==='crit',atenção:a=>a.level==='warn',offline:a=>a.level==='off'}
  const shown=list.filter(filtros[f])
  return (
    <>
      <Header title="Alertas" sub="Calculados agora com as leituras mais recentes e as faixas que você definiu">
        <div className="seg">{Object.keys(filtros).map(x=><button key={x} className={f===x?'on':''} onClick={()=>setF(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div>
      </Header>
      <ErrorBanner error={error} onRetry={reload}/>
      <div className="card">
        {loading&&<div className="skeleton" style={{height:60}}/>}
        {!loading&&shown.length===0&&<div className="empty">Nenhum alerta neste filtro. 🍇</div>}
        {shown.map(a=>(
          <div className="list-item" key={a.id}>
            <i className={`dot ${a.level}`}/>
            <div style={{flex:1}}>
              <div className="row wrap"><b>{a.type}</b><Chip s={a.level}/></div>
              <div className="muted" style={{fontSize:13.5}}>{a.safra||'Sensor'}{a.quando?` · última leitura ${timeAgo(a.quando)}`:''}</div>
              <div style={{marginTop:4}}>{a.msg}</div>
            </div>
            <Link className="btn sm" to={a.safraId?`/safras/${a.safraId}`:`/sensores/${a.dispositivoId}`}>Ver</Link>
          </div>))}
      </div>
    </>
  )
}
