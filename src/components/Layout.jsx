import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Grape, Bell, FileBarChart, CloudSun, Settings } from 'lucide-react'
import Logo from './Logo.jsx'

const items=[
  ['/','Dashboard',LayoutDashboard],['/safras','Safras',Grape],['/alertas','Alertas',Bell],
  ['/relatorios','Relatórios',FileBarChart],['/ambiente','Ambiente',CloudSun],['/configuracoes','Configurações',Settings]]

export default function Layout(){
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><Logo/></div>
        <nav className="nav" aria-label="Principal">
          {items.map(([to,label,Icon])=>(
            <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={19}/>{label}</NavLink>))}
        </nav>
        <div className="foot">Vale do São Francisco<br/>v0.1 — protótipo</div>
      </aside>
      <main className="main"><Outlet/></main>
      <nav className="tabs-mobile" aria-label="Principal móvel">
        {items.slice(0,5).map(([to,label,Icon])=>(
          <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={20}/>{label}</NavLink>))}
      </nav>
    </div>
  )
}
