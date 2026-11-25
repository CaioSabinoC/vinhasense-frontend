import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, WifiOff } from 'lucide-react'
import { statusLabel, fmt } from '../lib/derive.js'

const icons={ok:CheckCircle2,warn:AlertTriangle,crit:XCircle,off:WifiOff}
export function Chip({s,children}){
  const I=icons[s]||CheckCircle2
  return <span className={`chip ${s}`}><I size={14}/>{children||statusLabel[s]}</span>
}
export function Stat({icon:Icon,label,value,unit,note}){
  return (
    <div className="card stat">
      <div className="label"><span className="icon-badge"><Icon size={17}/></span>{label}</div>
      <div className="value">{value}{unit&&<small>{unit}</small>}</div>
      {note&&<div className="delta">{note}</div>}
    </div>
  )
}
export function Header({title,sub,children}){
  return (
    <div className="topbar">
      <div><h1>{title}</h1>{sub&&<div className="sub">{sub}</div>}</div>
      <div className="tools">{children}</div>
    </div>
  )
}
export function Seg({value,onChange,options}){
  return <div className="seg" role="tablist">{options.map(o=>
    <button key={o} className={value===o?'on':''} onClick={()=>onChange(o)}>{o}</button>)}</div>
}
export function Toggle({on,onChange,label}){
  return <button role="switch" aria-checked={on} aria-label={label} className={`switch ${on?'on':''}`} onClick={()=>onChange(!on)}/>
}
export { fmt }

export function ErrorBanner({error,onRetry}){
  if(!error) return null
  return <div className="err-banner" role="alert"><span>{error.message}</span>{onRetry&&<button className="btn sm" onClick={onRetry}>Tentar novamente</button>}</div>
}
