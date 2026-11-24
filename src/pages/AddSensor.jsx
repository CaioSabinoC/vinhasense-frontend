import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Header } from '../components/ui.jsx'
import { plots } from '../data/mock.js'

export default function AddSensor(){
  const [step,setStep]=useState(1)
  const [testing,setTesting]=useState(false)
  const [ok,setOk]=useState(false)
  const nav=useNavigate()
  const test=()=>{setTesting(true);setTimeout(()=>{setTesting(false);setOk(true)},1500)}
  return (
    <>
      <Header title="Adicionar sensor" sub={`Passo ${step} de 3`}/>
      <div className="card" style={{maxWidth:560}}>
        <div className="steps">{[1,2,3].map(n=><div key={n} className={`step ${n<=step?'on':''}`}/>)}</div>
        {step===1&&<>
          <h2 className="mb">1. Registrar dispositivo</h2>
          <div className="field"><label>ID do dispositivo (ESP32)</label><input className="input" placeholder="ESP32-XXXX"/></div>
          <div className="field"><label>Nome (opcional)</label><input className="input" placeholder="Ex.: Sensor linha 4"/></div></>}
        {step===2&&<>
          <h2 className="mb">2. Safra e profundidade</h2>
          <div className="field"><label>Safra</label><select className="input">{plots.map(p=><option key={p.id}>{p.name} — {p.variety}</option>)}</select></div>
          <div className="field"><label>Profundidade</label><select className="input"><option>30 cm</option><option>60 cm</option><option>90 cm</option></select></div></>}
        {step===3&&<>
          <h2 className="mb">3. Testar conexão</h2>
          {!ok&&<button className="btn primary" onClick={test} disabled={testing}>{testing?<><Loader2 size={18} className="spin"/>Testando…</>:'Testar conexão'}</button>}
          {ok&&<div className="notice" style={{background:'var(--vine-100)',color:'var(--vine)',borderColor:'transparent'}}><CheckCircle2 size={18}/>Conectado! Primeira leitura: umidade 27,1% · 30,8 °C</div>}</>}
        <div className="row between mt">
          <button className="btn" disabled={step===1} onClick={()=>setStep(step-1)}>Voltar</button>
          {step<3?<button className="btn primary" onClick={()=>setStep(step+1)}>Continuar</button>:<button className="btn primary" disabled={!ok} onClick={()=>nav('/safras')}>Concluir</button>}
        </div>
      </div>
    </>
  )
}
