import React, { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

// Mostra um convite para instalar o app (Chrome/Edge/Android)
export default function InstallPrompt(){
  const [evt, setEvt] = useState(null)
  useEffect(()=>{
    let dismissed = false
    try { dismissed = sessionStorage.getItem('vs.install.dismissed') === '1' } catch {}
    if (dismissed) return
    const h = e => { e.preventDefault(); setEvt(e) }
    const done = () => setEvt(null)
    window.addEventListener('beforeinstallprompt', h)
    window.addEventListener('appinstalled', done)
    return ()=>{ window.removeEventListener('beforeinstallprompt', h); window.removeEventListener('appinstalled', done) }
  },[])
  if (!evt) return null
  const close = () => { try { sessionStorage.setItem('vs.install.dismissed','1') } catch {}; setEvt(null) }
  const install = async () => { evt.prompt(); await evt.userChoice; setEvt(null) }
  return (
    <div className="install-bar" role="dialog" aria-label="Instalar aplicativo">
      <span style={{fontSize:14}}><b>Instalar VinhaSense</b><br/><span className="muted" style={{fontSize:12.5}}>Acesso rápido, direto da tela inicial.</span></span>
      <span className="row">
        <button className="btn primary sm" onClick={install}><Download size={15}/>Instalar</button>
        <button className="btn sm" onClick={close} aria-label="Dispensar"><X size={15}/></button>
      </span>
    </div>
  )
}
