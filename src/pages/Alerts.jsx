import React, { useState } from 'react'
import { Header, Chip } from '../components/ui.jsx'
import { alerts as seed, plotById } from '../data/mock.js'

export default function Alerts(){
  const [list,setList]=useState(seed)
  const [f,setF]=useState('todos')
  const shown=list.filter(a=>f==='todos'?true:f==='resolvidos'?a.state==='resolvido':f==='críticos'?a.level==='crit'&&a.state==='aberto':a.level==='warn'&&a.state==='aberto')
  const resolve=id=>setList(list.map(a=>a.id===id?{...a,state:'resolvido'}:a))
  return (
    <>
      <Header title="Alertas" sub="Condições fora das faixas que você definiu">
        <div className="seg">{['todos','críticos','atenção','resolvidos'].map(x=><button key={x} className={f===x?'on':''} onClick={()=>setF(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div>
      </Header>
      <div className="card">
        {shown.length===0&&<div className="empty">Nenhum alerta neste filtro. 🍇</div>}
        {shown.map(a=>(
          <div className="list-item" key={a.id} style={{opacity:a.state==='resolvido'?.6:1}}>
            <i className={`dot ${a.level==='beta'?'warn':a.level}`}/>
            <div style={{flex:1}}>
              <div className="row wrap"><b>{a.type}</b><Chip s={a.level}/>{a.level==='beta'&&<span className="muted" style={{fontSize:12.5}}>em breve — experimental</span>}</div>
              <div className="muted" style={{fontSize:13.5}}>{plotById(a.plot).name} · {a.when}</div>
              <div style={{marginTop:4}}>{a.msg}</div>
            </div>
            {a.state==='aberto'?<div className="row wrap"><button className="btn sm">Anotar</button><button className="btn sm primary" onClick={()=>resolve(a.id)}>Resolver</button></div>:<span className="chip ok">Resolvido</span>}
          </div>))}
      </div>
    </>
  )
}
