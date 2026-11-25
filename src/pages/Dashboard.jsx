import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Droplets, Thermometer, Radio, BellRing, RefreshCw, CloudSun } from 'lucide-react'
import { Header, Stat, Seg, ErrorBanner } from '../components/ui.jsx'
import { HistoryChart } from '../components/Charts.jsx'
import { useData } from '../data.jsx'
import { useSerie } from '../lib/hooks.js'
import { useThresholds } from '../settings.jsx'
import { fmt, fmtKg, fmtDate, timeAgo, deviceOnline, leituraDaSafra, statusDaSafra, derivarAlertas } from '../lib/derive.js'

export function Onboarding({ semSensor, semSafra }) {
  return (
    <div className="card cta-card">
      <h2>{semSensor ? 'Cadastre seu primeiro sensor' : 'Cadastre sua primeira safra'}</h2>
      <p>{semSensor
        ? 'Informe o canal do ThingSpeak do seu ESP32. As leituras que o servidor já recebe desse canal passam a aparecer aqui.'
        : 'Com a safra cadastrada, o painel calcula a previsão de colheita a partir das leituras do seu sensor.'}</p>
      <Link to={semSensor ? '/sensores/novo' : '/safras/nova'} className="btn primary">{semSensor ? 'Adicionar sensor' : 'Nova safra'}</Link>
    </div>
  )
}

export default function Dashboard(){
  const [range,setRange]=useState('24h')
  const [pick,setPick]=useState('')
  const nav=useNavigate()
  const { th } = useThresholds()
  const { safras, dispositivos, ultimas, loading, error, syncedAt, reload } = useData()

  const ativas = safras.filter(s=>s.status==='ativa')
  const safraGraf = ativas.find(s=>s._id===pick) || ativas[0]
  const { rows, loading: loadingSerie } = useSerie(safraGraf?.canalId || '', range)

  const now = Date.now()
  const calc = useMemo(()=>{
    const online = dispositivos.filter(d=>deviceOnline(d, ultimas[d.canalId], now))
    const leituras = online.map(d=>ultimas[d.canalId])
    const media = k => { const v = leituras.map(l=>l[k]).filter(x=>x!=null); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null }
    return { online: online.length, solo: media('umidadeSolo'), temp: media('temperatura'), ar: media('umidadeAr') }
  },[dispositivos, ultimas]) // eslint-disable-line
  const alertas = derivarAlertas(safras, dispositivos, ultimas, th)
  const comPrevisao = ativas.filter(s=>s.previsao?.kgEstimado!=null)
  const totalKg = comPrevisao.reduce((a,s)=>a+s.previsao.kgEstimado,0)
  const maxKg = Math.max(1, ...comPrevisao.map(s=>s.previsao.kgEstimado))

  if (loading) return <><Header title="Dashboard" sub="Carregando dados…"/><div className="card"><div className="skeleton" style={{height:120}}/></div></>

  return (
    <>
      <Header title="Dashboard" sub={`${safras.length} safra(s) · ${dispositivos.length} sensor(es)`}>
        {ativas.length>1&&<select className="input" style={{width:200}} aria-label="Safra do gráfico" value={safraGraf?._id||''} onChange={e=>setPick(e.target.value)}>{ativas.map(s=><option key={s._id} value={s._id}>{s.nome}</option>)}</select>}
        <Seg value={range} onChange={setRange} options={['24h','7d','30d']}/>
        <button className="chip off" style={{border:0,cursor:'pointer'}} onClick={reload} title="Atualizar agora"><RefreshCw size={13}/>{syncedAt?`Sincronizado ${timeAgo(syncedAt).replace('agora há pouco','agora')}`:'Sincronizar'}</button>
      </Header>
      <ErrorBanner error={error} onRetry={reload}/>

      {dispositivos.length===0 && <Onboarding semSensor/>}
      {dispositivos.length>0 && safras.length===0 && <Onboarding semSafra/>}

      {dispositivos.length>0 && <>
      <div className="grid g4">
        <Stat icon={Droplets} label="Umidade média do solo" value={fmt(calc.solo)} unit={calc.solo!=null?'%':''} note="média dos sensores online"/>
        <Stat icon={Thermometer} label="Temperatura média" value={fmt(calc.temp)} unit={calc.temp!=null?'°C':''} note={calc.ar!=null?`umidade do ar ${fmt(calc.ar)}%`:'média dos sensores online'}/>
        <Stat icon={Radio} label="Sensores online" value={`${calc.online}/${dispositivos.length}`} note={`${dispositivos.length-calc.online} offline`}/>
        <Stat icon={BellRing} label="Alertas abertos" value={alertas.length} note={`${alertas.filter(a=>a.level==='crit').length} críticos`}/>
      </div>

      {safras.length>0 && <>
      <div className="card mt">
        <div className="row between mb wrap">
          <div><h2>Previsão de colheita</h2><div className="sub">Estimativa calculada pelo servidor a partir das leituras desde a poda</div></div>
          <div style={{textAlign:'right'}}><div className="muted" style={{fontSize:12.5}}>Total previsto</div><b style={{fontSize:30}}>{fmtKg(totalKg)}</b> <span className="muted">kg</span></div>
        </div>
        {ativas.length===0 && <div className="empty">Nenhuma safra ativa.</div>}
        {ativas.map(s=>{ const p=s.previsao; return (
          <Link to={`/safras/${s._id}`} className="forecast-row" key={s._id}>
            <div><b>{s.nome}</b><div className="muted" style={{fontSize:13}}>{s.variedade} · {fmt(s.areaHa,2)} ha</div></div>
            <div className="bar" aria-hidden="true"><i style={{width:p?.kgEstimado!=null?(p.kgEstimado/maxKg*100)+'%':'0%'}}/></div>
            {p?.kgEstimado!=null
              ? <div style={{textAlign:'right'}}><b>{fmtKg(p.kgEstimado)} kg</b><div className="muted" style={{fontSize:13}}>{p.dataColheitaPrevista?`colheita ~ ${fmtDate(p.dataColheitaPrevista)} · `:''}confiabilidade {p.confiabilidade}</div></div>
              : <div style={{textAlign:'right'}} className="muted">{s.previsaoErro||'Sem previsão'}</div>}
          </Link>)})}
      </div>

      <div className="grid g-main mt">
        <div className="card">
          <div className="row between mb"><h2>Histórico{safraGraf?` — ${safraGraf.nome}`:''}</h2>{safraGraf&&<Link to={`/safras/${safraGraf._id}`} className="btn sm">Ver safra</Link>}</div>
          {loadingSerie?<div className="skeleton" style={{height:240}}/>:<HistoryChart data={rows} th={th}/>}
        </div>
        <div className="card">
          <h2 className="mb">Safras agora</h2>
          <div className="map" aria-label="Situação das safras">
            {safras.map(s=>{ const l=leituraDaSafra(s,dispositivos,ultimas); const st=statusDaSafra(s,dispositivos,ultimas,th); return (
              <div key={s._id} className={`plot-tile ${st}`} onClick={()=>nav(`/safras/${s._id}`)} role="link" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&nav(`/safras/${s._id}`)}>
                <span>{s.nome}</span><b>{st==='off'?'offline':fmt(l?.umidadeSolo)+'%'}</b><span style={{opacity:.9}}>{s.variedade}</span>
              </div>)})}
          </div>
          <div className="legend"><span><i className="dot ok"/>Normal</span><span><i className="dot warn"/>Atenção</span><span><i className="dot crit"/>Crítico</span><span><i className="dot off"/>Offline</span></div>
        </div>
      </div></>}

      <div className="card mt">
        <div className="row between"><h2>Últimos alertas</h2><Link to="/alertas" className="btn sm">Ver todos</Link></div>
        {alertas.length===0 && <div className="empty">Tudo dentro das faixas que você definiu. 🍇</div>}
        {alertas.slice(0,4).map(a=>(
          <div className="list-item" key={a.id}>
            <i className={`dot ${a.level}`}/>
            <div style={{flex:1}}><b>{a.type}</b>{a.safra&&<span className="muted"> · {a.safra}</span>}<div className="muted" style={{fontSize:13.5}}>{a.msg}</div></div>
            <span className="muted" style={{fontSize:13,whiteSpace:'nowrap'}}>{a.quando?timeAgo(a.quando):''}</span>
          </div>))}
      </div></>}
    </>
  )
}
