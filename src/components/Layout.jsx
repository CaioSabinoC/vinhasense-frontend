import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Grape, Bell, FileBarChart, CloudSun, Settings, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../auth.jsx'

const items=[
  ['/','Dashboard',LayoutDashboard],['/safras','Safras',Grape],['/alertas','Alertas',Bell],
  ['/relatorios','Relatórios',FileBarChart],['/ambiente','Ambiente',CloudSun],['/configuracoes','Configurações',Settings]]

export default function Layout(){
  const { user, signOut } = useAuth()
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><Logo/></div>
        <nav className="nav" aria-label="Principal">
          {items.map(([to,label,Icon])=>(
            <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={19}/>{label}</NavLink>))}
        </nav>
        <div className="foot">
          <button className="link-btn" style={{color:'#E8C9D2',marginBottom:8}} onClick={signOut}><LogOut size={15}/> Sair</button><br/>
          <span style={{opacity:.8}}>{user?.email}</span><br/>Vale do São Francisco<br/>v0.1 — protótipo</div>
      </aside>
      <main className="main"><Outlet/></main>
      <nav className="tabs-mobile" aria-label="Principal móvel">
        {items.slice(0,5).map(([to,label,Icon])=>(
          <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={20}/>{label}</NavLink>))}
      </nav>
    </div>
  )
}
