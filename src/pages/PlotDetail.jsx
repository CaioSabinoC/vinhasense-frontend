import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Droplets, Thermometer, Sprout, Scale, CloudSun } from 'lucide-react'
import { Header, Stat, Chip, Seg, ErrorBanner } from '../components/ui.jsx'
import { HistoryChart } from '../components/Charts.jsx'
import { useData } from '../data.jsx'
import { useAsync, useSerie } from '../lib/hooks.js'
import { api } from '../lib/api.js'
import { useThresholds } from '../settings.jsx'
import { fmt, fmtKg, fmtDate, fmtDateTime, timeAgo, deviceStatus, leituraDaSafra, statusDaSafra, canaisDaSafra } from '../lib/derive.js'

export default function PlotDetail(){
  const { id }=useParams()
  const nav=useNavigate()
  const { th }=useThresholds()
  const { safras, dispositivos, ultimas, loading, error, reload } = useData()
  const [range,setRange]=useState('7d')
  const [kg,setKg]=useState('')
  const [encerrando,setEncerrando]=useState(false)
  const [msg,setMsg]=useState('')
  const s=safras.find(x=>x._id===id)
  const { rows, loading: loadingSerie } = useSerie(s?.canalId||'', range)
  const hist = useAsync(()=>api(`/safras/${id}/previsoes`),[id])

  if(loading) return <div className="card"><div className="skeleton" style={{height:120}}/></div>
  if(!s) return <><ErrorBanner error={error} onRetry={reload}/><div className="empty">Safra não encontrada. <Link to="/safras">Voltar</Link></div></>

  const l=leituraDaSafra(s,dispositivos,ultimas)
  const st=statusDaSafra(s,dispositivos,ultimas,th)
  const p=s.previsao
  const canais=canaisDaSafra(s,dispositivos)
  const meus=dispositivos.filter(d=>canais.includes(d.canalId))
  const encerrada=s.status==='encerrada'

  const encerrar=async e=>{
    e.preventDefault(); setMsg('')
    try{ await api(`/safras/${id}/encerrar`,{method:'PATCH',body:{colheitaRealKg:Number(kg)}}); setEncerrando(false); await reload() }
    catch(x){ setMsg(x.message) }
  }
  const registrarPrevisao=async()=>{
    setMsg('')
    try{ await api(`/safras/${id}/previsao`); hist.reload(); setMsg('Previsão registrada no histórico.') }
    catch(x){ setMsg(x.message) }
  }

  return (
    <>
      <Header title={`${s.nome} — ${s.variedade}`} sub={`${fmt(s.areaHa,2)} ha · poda em ${fmtDate(s.dataPoda)} · base ${fmtKg(s.produtividadeBaseKgHa)} kg/ha`}>
        <span className="chip beta"><Sprout size={14}/>{encerrada?`Encerrada em ${fmtDate(s.encerradaEm)}`:'Safra ativa'}</span>{!encerrada&&<Chip s={st}/>}
      </Header>

      <div className="grid g4">
        <Stat icon={Droplets} label="Umidade do solo agora" value={fmt(l?.umidadeSolo)} unit={l?.umidadeSolo!=null?'%':''} note={`faixa definida: ${th.mMin}–${th.mMax}%`}/>
        <Stat icon={Thermometer} label="Temperatura agora" value={fmt(l?.temperatura)} unit={l?.temperatura!=null?'°C':''} note={`faixa definida: ${th.tMin}–${th.tMax} °C`}/>
        <Stat icon={CloudSun} label="Umidade do ar agora" value={fmt(l?.umidadeAr)} unit={l?.umidadeAr!=null?'%':''} note={l?`leitura ${timeAgo(l.lidoEm)}`:'sem leituras'}/>
        {encerrada
          ? <Stat icon={Scale} label="Colheita real" value={fmtKg(s.colheitaRealKg)} unit="kg" note={`${fmtKg(s.colheitaRealKg/s.areaHa)} kg/ha`}/>
          : <Stat icon={Scale} label="Previsão de colheita" value={p?.kgEstimado!=null?fmtKg(p.kgEstimado):'—'} unit={p?.kgEstimado!=null?'kg':''}
              note={p?.kgEstimado!=null?`${p.dataColheitaPrevista?`~ ${fmtDate(p.dataColheitaPrevista)} · `:''}${fmtKg(p.kgEstimado/s.areaHa)} kg/ha · confiabilidade ${p.confiabilidade}`:(s.previsaoErro||'sem previsão')}/>}
      </div>
      <div className="notice mt" style={{alignItems:'center'}}>As faixas são definidas por você em Configurações. O VinhaSense não assume valores ideais universais.</div>

      <div className="card mt">
        <div className="row between wrap mb"><h2>Histórico</h2><Seg value={range} onChange={setRange} options={['24h','7d','30d']}/></div>
        {loadingSerie?<div className="skeleton" style={{height:300}}/>:<HistoryChart data={rows} th={th} height={320}/>}
      </div>

      {!encerrada&&p?.kgEstimado!=null&&<div className="card mt">
        <div className="row between wrap mb"><h2>Como a previsão foi calculada</h2><button className="btn sm" onClick={registrarPrevisao}>Registrar no histórico</button></div>
        <dl className="kv">
          <dt>Fator climático</dt><dd>{fmt(p.fatorClima,2)} (0 a 1)</dd>
          <dt>Graus-dia acumulados</dt><dd>{p.grausDiaAcumulados} de {p.grausDiaAlvo}</dd>
          <dt>Dias restantes</dt><dd>{p.diasRestantes==null?'indefinido (temperatura abaixo da base)':p.diasRestantes}</dd>
          <dt>Cobertura de leituras</dt><dd>{p.diasComLeitura} de {p.diasDecorridos} dias</dd>
        </dl>
        {hist.data?.length>0&&<><h3 className="mb mt">Histórico de previsões</h3>
          <div className="table-wrap"><table><thead><tr><th>Calculada em</th><th>kg estimado</th><th>Colheita prevista</th><th>Confiabilidade</th></tr></thead>
            <tbody>{[...hist.data].reverse().slice(0,10).map(h=><tr key={h._id}><td>{fmtDateTime(h.calculadaEm)}</td><td>{fmtKg(h.kgEstimado)}</td><td>{fmtDate(h.dataColheitaPrevista)}</td><td>{h.confiabilidade}</td></tr>)}</tbody></table></div></>}
      </div>}

      <div className="grid g2 stack mt">
        <div className="card table-wrap">
          <h2 className="mb">Sensores</h2>
          {meus.length===0?<div className="empty">Nenhum sensor ligado a esta safra. <Link to="/sensores/novo">Adicionar sensor</Link></div>:
          <table><thead><tr><th>Sensor</th><th>Canal</th><th>Última leitura</th></tr></thead>
          <tbody>{meus.map(d=>(
            <tr key={d._id} className="click" onClick={()=>nav(`/sensores/${d._id}`)}>
              <td><b>{d.nome}</b><div><Chip s={deviceStatus(d,ultimas[d.canalId])}/></div></td><td>{d.canalId}</td><td>{ultimas[d.canalId]?timeAgo(ultimas[d.canalId].lidoEm):'—'}</td></tr>))}</tbody></table>}
        </div>
        <div className="card">
          <h2 className="mb">Encerrar safra</h2>
          {encerrada?<p className="muted">Safra encerrada com {fmtKg(s.colheitaRealKg)} kg colhidos.</p>:!encerrando?
            <><p className="muted">Ao fim da colheita, registre a produção real. O valor fica guardado para melhorar as próximas previsões.</p>
            <button className="btn" onClick={()=>setEncerrando(true)}>Encerrar safra</button></>:
            <form onSubmit={encerrar}>
              <div className="field"><label htmlFor="kg">Colheita real (kg)</label><input id="kg" className="input" type="number" min="0" step="any" required value={kg} onChange={e=>setKg(e.target.value)}/></div>
              <div className="row"><button type="button" className="btn" onClick={()=>setEncerrando(false)}>Cancelar</button><button className="btn primary">Confirmar encerramento</button></div>
            </form>}
          {msg&&<p className="sub" style={{marginTop:10}} role="status">{msg}</p>}
        </div>
      </div>
    </>
  )
}
