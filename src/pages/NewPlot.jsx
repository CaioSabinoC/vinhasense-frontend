import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Header } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { useData } from '../data.jsx'

export default function NewPlot(){
  const nav=useNavigate()
  const { dispositivos, reload } = useData()
  const [f,setF]=useState({nome:'',variedade:'',areaHa:'',dataPoda:'',produtividadeBaseKgHa:'',canalId:'',grausDiaColheita:''})
  const [err,setErr]=useState(''); const [busy,setBusy]=useState(false)
  const set=(k,v)=>setF({...f,[k]:v})
  const submit=async e=>{
    e.preventDefault(); setErr(''); setBusy(true)
    try{
      const body={nome:f.nome.trim(),variedade:f.variedade.trim(),areaHa:Number(f.areaHa),dataPoda:f.dataPoda,produtividadeBaseKgHa:Number(f.produtividadeBaseKgHa)}
      if(f.canalId) body.canalId=f.canalId
      if(f.grausDiaColheita) body.grausDiaColheita=Number(f.grausDiaColheita)
      const s=await api('/safras',{method:'POST',body})
      await reload()
      nav(`/safras/${s._id}`)
    }catch(x){ setErr(x.message); setBusy(false) }
  }
  return (
    <>
      <Header title="Nova safra" sub="Dados usados no cálculo da previsão de colheita"/>
      <form className="card" style={{maxWidth:560}} onSubmit={submit}>
        <div className="field"><label htmlFor="n">Nome</label><input id="n" className="input" required placeholder="Ex.: Safra 2026/27 — Quadra 1" value={f.nome} onChange={e=>set('nome',e.target.value)}/></div>
        <div className="field"><label htmlFor="v">Variedade</label><input id="v" className="input" required placeholder="Ex.: Syrah" value={f.variedade} onChange={e=>set('variedade',e.target.value)}/></div>
        <div className="grid g2">
          <div className="field"><label htmlFor="a">Área (ha)</label><input id="a" className="input" type="number" step="0.01" min="0.01" required value={f.areaHa} onChange={e=>set('areaHa',e.target.value)}/></div>
          <div className="field"><label htmlFor="d">Data da poda</label><input id="d" className="input" type="date" required value={f.dataPoda} onChange={e=>set('dataPoda',e.target.value)}/></div>
        </div>
        <div className="field"><label htmlFor="p">Produtividade base (kg/ha)</label><input id="p" className="input" type="number" min="1" required value={f.produtividadeBaseKgHa} onChange={e=>set('produtividadeBaseKgHa',e.target.value)}/>
          <span className="sub">Produtividade esperada em condições ideais; a previsão ajusta esse valor pelo clima medido.</span></div>
        <div className="field"><label htmlFor="g">Graus-dia até a colheita (opcional)</label><input id="g" className="input" type="number" min="1" placeholder="Padrão do sistema se vazio" value={f.grausDiaColheita} onChange={e=>set('grausDiaColheita',e.target.value)}/></div>
        <div className="field"><label htmlFor="c">Sensor da safra</label>
          <select id="c" className="input" value={f.canalId} onChange={e=>set('canalId',e.target.value)}>
            <option value="">Todos os meus sensores</option>
            {dispositivos.map(d=><option key={d._id} value={d.canalId}>{d.nome} (canal {d.canalId})</option>)}
          </select></div>
        {err&&<p className="form-err" role="alert">{err}</p>}
        <div className="row between">
          <button type="button" className="btn" onClick={()=>nav('/safras')}>Cancelar</button>
          <button className="btn primary" disabled={busy}>{busy?<><Loader2 size={18} className="spin"/>Salvando…</>:'Criar safra'}</button>
        </div>
      </form>
    </>
  )
}
