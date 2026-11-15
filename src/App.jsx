import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Plots from './pages/Plots.jsx'
import PlotDetail from './pages/PlotDetail.jsx'
import SensorDetail from './pages/SensorDetail.jsx'
import Alerts from './pages/Alerts.jsx'
import Settings from './pages/Settings.jsx'
import Reports from './pages/Reports.jsx'
import Environment from './pages/Environment.jsx'
import AddSensor from './pages/AddSensor.jsx'

// Limites definidos pelo produtor (não existem valores ideais universais)
const Ctx = createContext()
export const useThresholds = () => useContext(Ctx)

export default function App(){
  const [th,setTh] = useState({mMin:18,mMax:35,tMin:20,tMax:33})
  const [theme,setTheme] = useState('light')
  useEffect(()=>{document.documentElement.dataset.theme=theme},[theme])
  return (
    <Ctx.Provider value={{th,setTh}}>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route element={<Layout theme={theme} setTheme={setTheme}/>}>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/safras" element={<Plots/>}/>
          <Route path="/safras/:id" element={<PlotDetail/>}/>
          <Route path="/sensores/:id" element={<SensorDetail/>}/>
          <Route path="/sensores/novo" element={<AddSensor/>}/>
          <Route path="/alertas" element={<Alerts/>}/>
          <Route path="/relatorios" element={<Reports/>}/>
          <Route path="/ambiente" element={<Environment/>}/>
          <Route path="/configuracoes" element={<Settings theme={theme} setTheme={setTheme}/>}/>
        </Route>
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </Ctx.Provider>
  )
}
