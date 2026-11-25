import React, { useState, useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Loader2, Copy, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth, authApi } from '../auth.jsx'

const LEN = 6

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
  // credenciais -> (configurar | otp) -> recuperacao (só no primeiro acesso)
  const [step, setStep] = useState('credenciais')
  const [mode, setMode] = useState('entrar')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [code, setCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [recCode, setRecCode] = useState('')
  const [partial, setPartial] = useState(null)   // token parcial (só senha): não acessa a API
  const [qr, setQr] = useState(null)             // { qrCode, otpauthUrl }
  const [grant, setGrant] = useState(null)       // { token, codigos } após ativar o OTP
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // Depois de mostrar os códigos de recuperação, o login só é concluído quando o usuário confirma
  if (user && !grant) return <Navigate to={loc.state?.from || '/'} replace/>

  const reset = () => { setStep('credenciais'); setCode(''); setRecCode(''); setUseRecovery(false); setPartial(null); setQr(null); setErr('') }

  // Token parcial vale poucos minutos: se vencer, recomeça do login
  const handle = x => {
    if (x.status === 401 && /autenticado/i.test(x.message)) { reset(); setErr('Sessão de verificação expirada. Entre novamente.') }
    else setErr(x.message)
  }

  const submitCreds = async e => {
    e.preventDefault(); setErr('')
    if (mode === 'criar' && pass.length < 8) { setErr('A senha precisa ter ao menos 8 caracteres.'); return }
    setBusy(true)
    try {
      const r = await (mode === 'criar' ? authApi.registrar(email.trim(), pass) : authApi.login(email.trim(), pass))
      setPartial(r.tokenParcial); setCode('')
      if (r.etapa === 'configurar-otp') { setQr({ qrCode: r.qrCode, otpauthUrl: r.otpauthUrl }); setStep('configurar') }
      else setStep('otp')
    } catch (x) { setErr(x.message) }
    finally { setBusy(false) }
  }

  const submitSetup = async e => {
    e.preventDefault()
    if (code.length < LEN) { setErr('Digite os 6 dígitos.'); return }
    setErr(''); setBusy(true)
    try {
      const r = await authApi.confirmarOtp(partial, code)
      setGrant({ token: r.tokenAcesso, codigos: r.codigosRecuperacao })
      setStep('recuperacao')
    } catch (x) { handle(x); setCode('') }
    finally { setBusy(false) }
  }

  const submitOtp = async e => {
    e.preventDefault()
    if (!useRecovery && code.length < LEN) { setErr('Digite os 6 dígitos.'); return }
    if (useRecovery && recCode.trim().length < 10) { setErr('Digite o código de recuperação.'); return }
    setErr(''); setBusy(true)
    try {
      const r = await authApi.verificarOtp(partial, useRecovery ? { codigoRecuperacao: recCode.trim() } : { codigo: code })
      signIn(r.tokenAcesso, email.trim())
      nav(loc.state?.from || '/', { replace: true })
    } catch (x) { handle(x); setCode(''); setBusy(false) }
  }

  const copyCodes = async () => {
    try { await navigator.clipboard.writeText(grant.codigos.join('\n')); setCopied(true) } catch { setCopied(false) }
  }
  const finish = () => { signIn(grant.token, email.trim()); nav(loc.state?.from || '/', { replace: true }) }

  const secret = qr ? new URL(qr.otpauthUrl).searchParams.get('secret') : ''

  return (
    <div className="login">
      <div className="hero">
        <div className="brand" style={{padding:0,marginBottom:'auto'}}><Logo/></div>
        <h2>Monitoramento inteligente do seu vinhedo</h2>
        <p style={{opacity:.8,maxWidth:420}}>Umidade do solo, temperatura e umidade do ar em tempo quase real, com histórico por safra — feito para a viticultura do Vale do São Francisco.</p>
      </div>
      <div className="form">
        {step === 'credenciais' && (
          <form className="card" onSubmit={submitCreds}>
            <div className="steps" aria-hidden="true"><div className="step on"/><div className="step"/></div>
            <h1 style={{fontSize:26,marginBottom:4}}>{mode === 'criar' ? 'Criar conta' : 'Entrar'}</h1>
            <p className="sub mb">Etapa 1 de 2 · {mode === 'criar' ? 'Cadastre seu acesso' : 'Acesse sua propriedade'}</p>
            <div className="field"><label htmlFor="e">E-mail</label>
              <input id="e" className="input" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="field"><label htmlFor="p">Senha{mode === 'criar' && ' (mínimo 8 caracteres)'}</label>
              <input id="p" className="input" type="password" autoComplete={mode === 'criar' ? 'new-password' : 'current-password'} required minLength={mode === 'criar' ? 8 : undefined} value={pass} onChange={e=>setPass(e.target.value)}/></div>
            {err && <p className="form-err" role="alert">{err}</p>}
            <button className="btn primary" style={{width:'100%'}} disabled={busy}>
              {busy ? <><Loader2 size={18} className="spin"/>Verificando…</> : 'Continuar'}
            </button>
            <p className="sub" style={{textAlign:'center',marginTop:14}}>
              {mode === 'criar' ? 'Já tem conta? ' : 'Primeira vez aqui? '}
              <button type="button" className="link-btn" onClick={()=>{setMode(mode === 'criar' ? 'entrar' : 'criar'); setErr('')}}>
                {mode === 'criar' ? 'Entrar' : 'Criar conta'}</button>
            </p>
          </form>
        )}

        {step === 'configurar' && (
          <form className="card" onSubmit={submitSetup}>
            <div className="steps" aria-hidden="true"><div className="step on"/><div className="step on"/></div>
            <div className="icon-badge" style={{marginBottom:12}}><ShieldCheck size={18}/></div>
            <h1 style={{fontSize:26,marginBottom:4}}>Ative a verificação</h1>
            <p className="sub mb">Escaneie o QR Code no Google Authenticator, Authy ou similar e digite o código de 6 dígitos que aparecer.</p>
            <img className="qr" src={qr.qrCode} alt="QR Code para o app autenticador" width="200" height="200"/>
            <p className="sub" style={{textAlign:'center',margin:'4px 0 14px'}}>Sem câmera? Digite a chave: <b className="mono">{secret}</b></p>
            <CodeInput value={code} onChange={c=>{setCode(c); setErr('')}} disabled={busy}/>
            {err && <p className="form-err" role="alert" style={{marginTop:12}}>{err}</p>}
            <button className="btn primary" style={{width:'100%',marginTop:16}} disabled={busy || code.length < LEN}>
              {busy ? <><Loader2 size={18} className="spin"/>Validando…</> : 'Ativar e continuar'}
            </button>
            <div className="row between mt">
              <button type="button" className="link-btn" onClick={reset}><ArrowLeft size={14}/> Voltar</button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form className="card" onSubmit={submitOtp}>
            <div className="steps" aria-hidden="true"><div className="step on"/><div className="step on"/></div>
            <div className="icon-badge" style={{marginBottom:12}}><ShieldCheck size={18}/></div>
            <h1 style={{fontSize:26,marginBottom:4}}>Verificação</h1>
            {useRecovery ? (
              <>
                <p className="sub mb">Etapa 2 de 2 · Use um dos códigos de recuperação que você guardou. Cada código vale uma vez.</p>
                <div className="field"><label htmlFor="rc">Código de recuperação</label>
                  <input id="rc" className="input mono" placeholder="XXXXX-XXXXX" autoComplete="off" value={recCode} onChange={e=>{setRecCode(e.target.value.toUpperCase()); setErr('')}} disabled={busy}/></div>
              </>
            ) : (
              <>
                <p className="sub mb">Etapa 2 de 2 · Digite o código de 6 dígitos do seu app autenticador</p>
                <CodeInput value={code} onChange={c=>{setCode(c); setErr('')}} disabled={busy}/>
              </>
            )}
            {err && <p className="form-err" role="alert" style={{marginTop:12}}>{err}</p>}
            <button className="btn primary" style={{width:'100%',marginTop:16}} disabled={busy || (useRecovery ? recCode.trim().length < 10 : code.length < LEN)}>
              {busy ? <><Loader2 size={18} className="spin"/>Validando…</> : 'Verificar e entrar'}
            </button>
            <div className="row between mt">
              <button type="button" className="link-btn" onClick={reset}><ArrowLeft size={14}/> Voltar</button>
              <button type="button" className="link-btn" onClick={()=>{setUseRecovery(!useRecovery); setErr(''); setCode(''); setRecCode('')}}>
                {useRecovery ? 'Usar o app autenticador' : 'Usar código de recuperação'}
              </button>
            </div>
          </form>
        )}

        {step === 'recuperacao' && grant && (
          <div className="card">
            <div className="icon-badge" style={{marginBottom:12}}><ShieldCheck size={18}/></div>
            <h1 style={{fontSize:26,marginBottom:4}}>Guarde seus códigos</h1>
            <p className="sub mb">Se perder o celular, estes códigos são a única forma de entrar. Cada um vale uma vez e <b>não serão mostrados de novo</b>.</p>
            <div className="recovery">{grant.codigos.map(c => <span key={c} className="mono">{c}</span>)}</div>
            <button type="button" className="btn" style={{width:'100%',marginTop:14}} onClick={copyCodes}>
              {copied ? <><Check size={16}/>Copiado</> : <><Copy size={16}/>Copiar códigos</>}
            </button>
            <button type="button" className="btn primary" style={{width:'100%',marginTop:10}} onClick={finish}>Guardei, entrar</button>
          </div>
        )}
      </div>
    </div>
  )
}
