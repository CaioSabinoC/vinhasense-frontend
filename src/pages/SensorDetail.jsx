import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Header, Chip, ErrorBanner } from '../components/ui.jsx'
import { useData } from '../data.jsx'
import { useAsync } from '../lib/hooks.js'
import { api } from '../lib/api.js'
import { fmt, fmtDateTime, timeAgo, deviceStatus } from '../lib/derive.js'

export default function SensorDetail(){
  const { id }=useParams()
  const { dispositivos, ultimas, loading, reload } = useData()
  const d=dispositivos.find(x=>x._id===id)
  const [edit,setEdit]=useState(null)
  const [msg,setMsg]=useState('')
  const rows=useAsync(async()=>{
    if(!d) return []
    const inicio=new Date(Date.now()-30*24*3600e3).toISOString()
    return (await api('/leituras',{query:{canalId:d.canalId,inicio,limite:50}})).reverse()
  },[d?.canalId])

  if(loading) return <div className="card"><div className="skeleton" style={{height:120}}/></div>
  if(!d) return <div className="empty">Sensor não encontrado. <Link to="/sensores">Voltar</Link></div>
  const l=ultimas[d.canalId]

  const salvar=async e=>{
    e.preventDefault(); setMsg('')
    try{
      await api(`/dispositivos/${d._id}`,{method:'PATCH',body:{nome:edit.nome.trim(),intervaloSegundos:Number(edit.intervaloSegundos)}})
      setEdit(null); await reload()
    }catch(x){ setMsg(x.message) }
  }

  return (
    <>
      <Header title={d.nome} sub={`Canal ThingSpeak ${d.canalId}`}><Chip s={deviceStatus(d,l)}/><Link to="/sensores" className="btn">Todos os sensores</Link></Header>
      <div className="grid g2 stack">
        <div className="card"><div className="row between mb"><h2>Dispositivo</h2>{!edit&&<button className="btn sm" onClick={()=>setEdit({nome:d.nome,intervaloSegundos:d.intervaloSegundos})}>Editar</button>}</div>
          {edit?<form onSubmit={salvar}>
            <div className="field"><label htmlFor="n">Nome</label><input id="n" className="input" required value={edit.nome} onChange={e=>setEdit({...edit,nome:e.target.value})}/></div>
            <div className="field"><label htmlFor="i">Intervalo de envio (segundos)</label><input id="i" className="input" type="number" min="15" required value={edit.intervaloSegundos} onChange={e=>setEdit({...edit,intervaloSegundos:e.target.value})}/></div>
            <div className="row"><button type="button" className="btn" onClick={()=>setEdit(null)}>Cancelar</button><button className="btn primary">Salvar</button></div>
          </form>:
          <dl className="kv">
            <dt>Nome</dt><dd>{d.nome}</dd><dt>Canal</dt><dd>{d.canalId}</dd>
            <dt>Intervalo</dt><dd>a cada {d.intervaloSegundos} s</dd>
            <dt>Cadastrado em</dt><dd>{fmtDateTime(d.createdAt)}</dd>
            <dt>Última leitura</dt><dd>{l?`${timeAgo(l.lidoEm)} (${fmtDateTime(l.lidoEm)})`:'nenhuma recebida'}</dd></dl>}
          {msg&&<p className="form-err" role="alert" style={{marginTop:10}}>{msg}</p>}
          <p className="sub mt">Considera-se offline quando não chega leitura em 3× o intervalo (mínimo de 2 min).</p>
        </div>
        <div className="card"><h2 className="mb">Valores atuais</h2>
          {l?<dl className="kv"><dt>Umidade do solo</dt><dd>{fmt(l.umidadeSolo)}%</dd><dt>Temperatura</dt><dd>{fmt(l.temperatura)} °C</dd><dt>Umidade do ar</dt><dd>{fmt(l.umidadeAr)}%</dd></dl>
            :<div className="empty">Este canal ainda não enviou leituras. Confira se o ESP32 está publicando no ThingSpeak e se o servidor está assinando o canal.</div>}
        </div>
      </div>
      <div className="card mt table-wrap"><h2 className="mb">Últimas 50 leituras</h2>
        {rows.loading?<div className="skeleton" style={{height:80}}/>:rows.data?.length?
        <table><thead><tr><th>Data e hora</th><th>Umidade solo</th><th>Temperatura</th><th>Umidade ar</th></tr></thead>
          <tbody>{rows.data.map(r=><tr key={r._id}><td>{fmtDateTime(r.lidoEm)}</td><td>{fmt(r.umidadeSolo)}%</td><td>{fmt(r.temperatura)} °C</td><td>{fmt(r.umidadeAr)}%</td></tr>)}</tbody></table>
        :<div className="empty">Nenhuma leitura nos últimos 30 dias.</div>}</div>
    </>
  )
}
