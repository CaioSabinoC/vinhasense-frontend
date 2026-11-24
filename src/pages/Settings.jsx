import React, { useState } from 'react'
import { Info } from 'lucide-react'
import { Header, Toggle } from '../components/ui.jsx'
import { plots } from '../data/mock.js'
import { useThresholds } from '../App.jsx'

export default function Settings({theme,setTheme}){
  const { th,setTh }=useThresholds()
  const [plot,setPlot]=useState('t01')
  const [ch,setCh]=useState({push:true,email:true,whats:false})
  const [saved,setSaved]=useState(false)
  const set=(k,v)=>{setTh({...th,[k]:+v});setSaved(false)}
  const Num=({k,l,u})=><div className="field"><label>{l} ({u})</label><input className="input" type="number" value={th[k]} onChange={e=>set(k,e.target.value)}/></div>
  return (
    <>
      <Header title="Configurações" sub="Limites, notificações e aparência"/>
      <div className="grid g2 stack">
        <div className="card">
          <h2 className="mb">Limites por safra</h2>
          <div className="notice mb"><Info size={18} style={{flex:'none'}}/>Valores definidos por você — não existem limites ideais universais. Dependem de variedade, porta-enxerto, solo, manejo e fase da cultura.</div>
          <div className="field"><label>Safra</label><select className="input" value={plot} onChange={e=>setPlot(e.target.value)}>{plots.map(p=><option key={p.id} value={p.id}>{p.name} — {p.variety}</option>)}</select></div>
          <div className="grid g2"><Num k="mMin" l="Umidade mínima" u="%"/><Num k="mMax" l="Umidade máxima" u="%"/><Num k="tMin" l="Temp. mínima" u="°C"/><Num k="tMax" l="Temp. máxima" u="°C"/></div>
          <button className="btn primary" onClick={()=>setSaved(true)}>Salvar limites</button>{saved&&<span className="chip ok" style={{marginLeft:10}}>Salvo</span>}
        </div>
        <div className="card">
          <h2 className="mb">Notificações</h2>
          {[['push','Notificação no app'],['email','E-mail'],['whats','WhatsApp']].map(([k,l])=>
            <div className="list-item between" key={k} style={{alignItems:'center'}}><span>{l}</span><Toggle on={ch[k]} onChange={v=>setCh({...ch,[k]:v})} label={l}/></div>)}
          <div className="grid g2 mt"><div className="field"><label>Silêncio de</label><input className="input" type="time" defaultValue="22:00"/></div><div className="field"><label>até</label><input className="input" type="time" defaultValue="05:00"/></div></div>
          <h2 className="mb mt">Aparência</h2>
          <div className="list-item between" style={{alignItems:'center'}}><span>Modo escuro</span><Toggle on={theme==='dark'} onChange={v=>setTheme(v?'dark':'light')} label="Modo escuro"/></div>
        </div>
      </div>
    </>
  )
}
