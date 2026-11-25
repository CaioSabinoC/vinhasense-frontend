import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Grape, Radio, Bell, FileBarChart, Settings, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../auth.jsx'
import { DataProvider } from '../data.jsx'

const items=[
  ['/','Dashboard',LayoutDashboard],['/safras','Safras',Grape],['/sensores','Sensores',Radio],['/alertas','Alertas',Bell],
  ['/relatorios','Relatórios',FileBarChart],['/configuracoes','Configurações',Settings]]

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
          <span style={{opacity:.8}}>{user?.email}</span><br/>Vale do São Francisco</div>
      </aside>
      <main className="main"><DataProvider><Outlet/></DataProvider></main>
      <nav className="tabs-mobile" aria-label="Principal móvel">
        {items.slice(0,5).map(([to,label,Icon])=>(
          <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={20}/>{label}</NavLink>))}
      </nav>
    </div>
  )
}
