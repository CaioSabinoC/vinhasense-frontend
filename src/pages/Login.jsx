import React, { useState, useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth, verifyPassword, verifyCode, resendCode, DEMO_EMAIL, DEMO_CODE } from '../auth.jsx'

const LEN = 6
const COOLDOWN = 30

function CodeInput({ value, onChange, disabled }){
  const refs = useRef([])
  const set = (i, ch) => {
    const arr = value.padEnd(LEN, ' ').split('')
    arr[i] = ch || ' '
    onChange(arr.join('').replace(/\s+$/,''))
  }
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i-1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i-1]?.focus()
    if (e.key === 'ArrowRight' && i < LEN-1) refs.current[i+1]?.focus()
  }
  const onInput = (i, e) => {
    const d = e.target.value.replace(/\D/g,'').slice(-1)
    set(i, d)
    if (d && i < LEN-1) refs.current[i+1]?.focus()
  }
  const onPaste = e => {
    const d = e.clipboardData.getData('text').replace(/\D/g,'').slice(0, LEN)
    if (!d) return
    e.preventDefault()
    onChange(d)
    refs.current[Math.min(d.length, LEN-1)]?.focus()
  }
  return (
    <div className="otp" role="group" aria-label="Código de verificação de 6 dígitos">
      {Array.from({length:LEN}).map((_,i)=>(
        <input key={i} ref={el=>refs.current[i]=el} className="input otp-box"
          inputMode="numeric" autoComplete={i===0?'one-time-code':'off'} maxLength={1}
          value={value[i] && value[i] !== ' ' ? value[i] : ''} disabled={disabled}
          aria-label={`Dígito ${i+1}`}
          onChange={e=>onInput(i,e)} onKeyDown={e=>onKey(i,e)} onPaste={onPaste} onFocus={e=>e.target.select()}/>
      ))}
    </div>
  )
}

export default function Login(){
  const nav = useNavigate()
  const loc = useLocation()
  const { user, signIn } = useAuth()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [pass, setPass] = useState('123456')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(COOLDOWN)

  useEffect(()=>{
    if (step !== 2 || left <= 0) return
    const t = setTimeout(()=>setLeft(l=>l-1), 1000)
    return ()=>clearTimeout(t)
  },[step,left])

  if (user) return <Navigate to={loc.state?.from || '/'} replace/>

  const submitPass = async e => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { await verifyPassword(email, pass); setStep(2); setLeft(COOLDOWN); setCode('') }
    catch(x){ setErr(x.message) }
    finally { setBusy(false) }
  }
  const submitCode = async e => {
    e.preventDefault()
    if (code.length < LEN) { setErr('Digite os 6 dígitos.'); return }
    setErr(''); setBusy(true)
    try { await verifyCode(code); signIn(email); nav(loc.state?.from || '/', { replace:true }) }
    catch(x){ setErr(x.message); setCode(''); setBusy(false) }
  }
  const resend = async () => { setErr(''); await resendCode(); setLeft(COOLDOWN); setCode('') }

  const masked = email.replace(/^(.).*(@.*)$/, '$1•••$2')

  return (
    <div className="login">
      <div className="hero">
        <div className="brand" style={{padding:0,marginBottom:'auto'}}><Logo/></div>
        <h2>Monitoramento inteligente do seu vinhedo</h2>
        <p style={{opacity:.8,maxWidth:420}}>Umidade e temperatura do solo em tempo quase real, com histórico por safra — feito para a viticultura do Vale do São Francisco.</p>
      </div>
      <div className="form">
        {step === 1 ? (
          <form className="card" onSubmit={submitPass}>
            <div className="steps" aria-hidden="true"><div className="step on"/><div className="step"/></div>
            <h1 style={{fontSize:26,marginBottom:4}}>Entrar</h1>
            <p className="sub mb">Etapa 1 de 2 · Acesse sua propriedade</p>
            <div className="field"><label htmlFor="e">E-mail</label>
              <input id="e" className="input" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="field"><label htmlFor="p">Senha</label>
              <input id="p" className="input" type="password" autoComplete="current-password" required value={pass} onChange={e=>setPass(e.target.value)}/></div>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn primary" style={{width:'100%'}} disabled={busy}>
              {busy ? <><Loader2 size={18} className="spin"/>Verificando…</> : 'Continuar'}
            </button>
            <p className="sub" style={{textAlign:'center',marginTop:14}}>Esqueci minha senha</p>
          </form>
        ) : (
          <form className="card" onSubmit={submitCode}>
            <div className="steps" aria-hidden="true"><div className="step on"/><div className="step on"/></div>
            <div className="icon-badge" style={{marginBottom:12}}><ShieldCheck size={18}/></div>
            <h1 style={{fontSize:26,marginBottom:4}}>Verificação</h1>
            <p className="sub mb">Etapa 2 de 2 · Enviamos um código de 6 dígitos para <b>{masked}</b></p>
            <CodeInput value={code} onChange={c=>{setCode(c); setErr('')}} disabled={busy}/>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn primary" style={{width:'100%',marginTop:16}} disabled={busy || code.length < LEN}>
              {busy ? <><Loader2 size={18} className="spin"/>Validando…</> : 'Verificar e entrar'}
            </button>
            <div className="row between mt">
              <button type="button" className="link-btn" onClick={()=>{setStep(1);setErr('')}}><ArrowLeft size={14}/> Voltar</button>
              <button type="button" className="link-btn" onClick={resend} disabled={left>0}>
                {left>0 ? `Reenviar em ${left}s` : 'Reenviar código'}
              </button>
            </div>
            <div className="notice mt"><span>Protótipo: use o código <b>{DEMO_CODE}</b>.</span></div>
          </form>
        )}
      </div>
    </div>
  )
}
