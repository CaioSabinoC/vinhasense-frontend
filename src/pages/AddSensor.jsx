import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { Header } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { useData } from '../data.jsx'
import { fmt, fmtDateTime } from '../lib/derive.js'

export default function AddSensor(){
  const [step,setStep]=useState(1)
  const [f,setF]=useState({nome:'',canalId:'',intervaloSegundos:60})
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState('')
  const [created,setCreated]=useState(null)
  const [reading,setReading]=useState(undefined) // undefined = não testou; null = sem leituras
  const nav=useNavigate()
  const { reload } = useData()

  const testar=async(d)=>{
    try{ setReading(await api('/leituras/ultima',{query:{canalId:d.canalId}})) }
    catch(x){ if(x.status===404) setReading(null); else throw x }
  }
  const cadastrar=async()=>{
    setErr(''); setBusy(true)
    try{
      const d=created||await api('/dispositivos',{method:'POST',body:{nome:f.nome.trim(),canalId:f.canalId.trim(),intervaloSegundos:Number(f.intervaloSegundos)}})
      setCreated(d); await reload(); await testar(d)
    }catch(x){ setErr(x.message) }
    finally{ setBusy(false) }
  }
  const valido1=f.nome.trim()&&f.canalId.trim()
  return (
    <>
      <Header title="Adicionar sensor" sub={`Passo ${step} de 3`}/>
      <div className="card" style={{maxWidth:560}}>
        <div className="steps">{[1,2,3].map(n=><div key={n} className={`step ${n<=step?'on':''}`}/>)}</div>
        {step===1&&<>
          <h2 className="mb">1. Identificar o sensor</h2>
          <div className="field"><label htmlFor="nm">Nome</label><input id="nm" className="input" placeholder="Ex.: Sensor linha 4" value={f.nome} onChange={e=>setF({...f,nome:e.target.value})}/></div>
          <div className="field"><label htmlFor="ch">ID do canal no ThingSpeak</label><input id="ch" className="input" inputMode="numeric" placeholder="Ex.: 3493396" value={f.canalId} onChange={e=>setF({...f,canalId:e.target.value})}/>
            <span className="sub">É o número do canal para onde o ESP32 envia os dados.</span></div></>}
        {step===2&&<>
          <h2 className="mb">2. Intervalo de envio</h2>
          <div className="field"><label htmlFor="iv">A cada quantos segundos o ESP32 envia uma leitura?</label><input id="iv" className="input" type="number" min="15" value={f.intervaloSegundos} onChange={e=>setF({...f,intervaloSegundos:e.target.value})}/>
            <span className="sub">Mínimo 15 s. O painel marca o sensor como offline quando passam 3 intervalos sem leitura.</span></div></>}
        {step===3&&<>
          <h2 className="mb">3. Cadastrar e testar conexão</h2>
          <p className="muted mb">Canal <b>{f.canalId}</b> · {f.nome} · a cada {f.intervaloSegundos} s</p>
          {!created&&<button className="btn primary" onClick={cadastrar} disabled={busy}>{busy?<><Loader2 size={18} className="spin"/>Cadastrando…</>:'Cadastrar e testar'}</button>}
          {created&&reading&&<div className="notice" style={{background:'var(--vine-100)',color:'var(--vine)',borderColor:'transparent'}}><CheckCircle2 size={18} style={{flex:'none'}}/>Recebendo dados! Última leitura ({fmtDateTime(reading.lidoEm)}): solo {fmt(reading.umidadeSolo)}% · {fmt(reading.temperatura)} °C · ar {fmt(reading.umidadeAr)}%</div>}
          {created&&reading===null&&<>
            <div className="notice"><AlertTriangle size={18} style={{flex:'none'}}/>Sensor cadastrado, mas o servidor ainda não tem leituras deste canal. Confira se o ESP32 está enviando e aguarde alguns minutos.</div>
            <button className="btn mt" onClick={cadastrar} disabled={busy}>{busy?<Loader2 size={18} className="spin"/>:'Testar novamente'}</button></>}
        </>}
        {err&&<p className="form-err" role="alert" style={{marginTop:12}}>{err}</p>}
        <div className="row between mt">
          <button className="btn" disabled={step===1||!!created} onClick={()=>setStep(step-1)}>Voltar</button>
          {step<3?<button className="btn primary" disabled={step===1&&!valido1} onClick={()=>setStep(step+1)}>Continuar</button>
            :<button className="btn primary" disabled={!created} onClick={()=>nav('/sensores')}>Concluir</button>}
        </div>
      </div>
    </>
  )
}
