import React from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function Login(){
  const nav=useNavigate()
  return (
    <div className="login">
      <div className="hero">
        <div className="brand" style={{padding:0,marginBottom:'auto'}}><Logo/></div>
        <h2>Monitoramento inteligente do seu vinhedo</h2>
        <p style={{opacity:.8,maxWidth:420}}>Umidade e temperatura do solo em tempo quase real, com histórico por safra — feito para a viticultura do Vale do São Francisco.</p>
      </div>
      <div className="form">
        <form className="card" onSubmit={e=>{e.preventDefault();nav('/')}}>
          <h1 style={{fontSize:26,marginBottom:4}}>Entrar</h1>
          <p className="sub mb">Acesse sua propriedade</p>
          <div className="field"><label htmlFor="e">E-mail</label><input id="e" className="input" type="email" defaultValue="produtor@fazenda.com.br"/></div>
          <div className="field"><label htmlFor="p">Senha</label><input id="p" className="input" type="password" defaultValue="123456"/></div>
          <button className="btn primary" style={{width:'100%'}}>Entrar</button>
          <p className="sub" style={{textAlign:'center',marginTop:14}}>Esqueci minha senha</p>
        </form>
      </div>
    </div>
  )
}
