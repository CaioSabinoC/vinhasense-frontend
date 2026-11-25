import React, { useState } from 'react'
import { Info, LogOut } from 'lucide-react'
import { Header, Toggle } from '../components/ui.jsx'
import { useThresholds, LIMITES_PADRAO } from '../settings.jsx'
import { useAuth } from '../auth.jsx'

export default function Settings({theme,setTheme}){
  const { th,setTh }=useThresholds()
  const { user, signOut } = useAuth()
  const [draft,setDraft]=useState(()=>({...th}))
  const [saved,setSaved]=useState(false)
  const [err,setErr]=useState('')
  const set=(k,v)=>{setDraft({...draft,[k]:v});setSaved(false);setErr('')}
  const salvar=()=>{
    const n=Object.fromEntries(Object.entries(draft).map(([k,v])=>[k,Number(v)]))
    if(Object.values(n).some(v=>!Number.isFinite(v))) return setErr('Preencha todos os limites com números.')
    if(n.mMin>=n.mMax||n.tMin>=n.tMax) return setErr('O mínimo precisa ser menor que o máximo.')
    setTh(n); setSaved(true)
  }
  const num=(k,l,u)=><div className="field" key={k}><label htmlFor={k}>{l} ({u})</label><input id={k} className="input" type="number" value={draft[k]} onChange={e=>set(k,e.target.value)}/></div>
  return (
    <>
      <Header title="Configurações" sub="Limites de alerta, aparência e conta"/>
      <div className="grid g2 stack">
        <div className="card">
          <h2 className="mb">Limites de alerta</h2>
          <div className="notice mb"><Info size={18} style={{flex:'none'}}/>Valores definidos por você — não existem limites ideais universais. Dependem de variedade, porta-enxerto, solo, manejo e fase da cultura. Ficam salvos neste navegador.</div>
          <div className="grid g2">{num("mMin","Umidade do solo mínima","%")}{num("mMax","Umidade do solo máxima","%")}{num("tMin","Temp. mínima","°C")}{num("tMax","Temp. máxima","°C")}</div>
          {err&&<p className="form-err" role="alert">{err}</p>}
          <div className="row wrap"><button className="btn primary" onClick={salvar}>Salvar limites</button>
            <button className="btn" onClick={()=>{setDraft({...LIMITES_PADRAO});setSaved(false)}}>Restaurar padrão</button>
            {saved&&<span className="chip ok">Salvo</span>}</div>
        </div>
        <div className="card">
          <h2 className="mb">Aparência</h2>
          <div className="list-item between" style={{alignItems:'center'}}><span>Modo escuro</span><Toggle on={theme==='dark'} onChange={v=>setTheme(v?'dark':'light')} label="Modo escuro"/></div>
          <h2 className="mb mt">Conta</h2>
          <p className="muted mb">Conectado como <b>{user?.email}</b></p>
          <button className="btn" onClick={signOut}><LogOut size={16}/>Sair</button>
        </div>
      </div>
    </>
  )
}
