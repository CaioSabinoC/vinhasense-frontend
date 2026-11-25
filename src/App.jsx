import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Plots from './pages/Plots.jsx'
import NewPlot from './pages/NewPlot.jsx'
import PlotDetail from './pages/PlotDetail.jsx'
import Sensors from './pages/Sensors.jsx'
import SensorDetail from './pages/SensorDetail.jsx'
import Alerts from './pages/Alerts.jsx'
import Settings from './pages/Settings.jsx'
import Reports from './pages/Reports.jsx'
import AddSensor from './pages/AddSensor.jsx'
import { AuthProvider, RequireAuth } from './auth.jsx'
import { ThresholdsProvider, useTheme } from './settings.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'

export default function App(){
  const [theme,setTheme] = useTheme()
  return (
    <AuthProvider>
    <ThresholdsProvider>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route element={<RequireAuth><Layout/></RequireAuth>}>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/safras" element={<Plots/>}/>
          <Route path="/safras/nova" element={<NewPlot/>}/>
          <Route path="/safras/:id" element={<PlotDetail/>}/>
          <Route path="/sensores" element={<Sensors/>}/>
          <Route path="/sensores/novo" element={<AddSensor/>}/>
          <Route path="/sensores/:id" element={<SensorDetail/>}/>
          <Route path="/alertas" element={<Alerts/>}/>
          <Route path="/relatorios" element={<Reports/>}/>
          <Route path="/configuracoes" element={<Settings theme={theme} setTheme={setTheme}/>}/>
        </Route>
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
      <InstallPrompt/>
    </ThresholdsProvider>
    </AuthProvider>
  )
}
