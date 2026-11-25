import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Header, Chip, ErrorBanner } from '../components/ui.jsx'
import { Onboarding } from './Dashboard.jsx'
import { useData } from '../data.jsx'
import { fmt, timeAgo, deviceStatus } from '../lib/derive.js'

export default function Sensors(){
  const nav=useNavigate()
  const { dispositivos, ultimas, loading, error, reload } = useData()
  return (
    <>
      <Header title="Sensores" sub={loading?'Carregando…':`${dispositivos.length} sensor(es) cadastrado(s)`}>
        <Link to="/sensores/novo" className="btn primary"><Plus size={18}/>Adicionar sensor</Link>
      </Header>
      <ErrorBanner error={error} onRetry={reload}/>
      {!loading && dispositivos.length===0 && <Onboarding semSensor/>}
      {dispositivos.length>0 && <div className="card table-wrap"><table>
        <thead><tr><th>Sensor</th><th>Canal ThingSpeak</th><th>Umidade solo</th><th>Temperatura</th><th>Umidade ar</th><th>Última leitura</th></tr></thead>
        <tbody>{dispositivos.map(d=>{ const l=ultimas[d.canalId]; return (
          <tr key={d._id} className="click" onClick={()=>nav(`/sensores/${d._id}`)}>
            <td><b>{d.nome}</b><div><Chip s={deviceStatus(d,l)}/></div></td><td>{d.canalId}</td>
            <td>{fmt(l?.umidadeSolo)}{l?.umidadeSolo!=null&&'%'}</td><td>{fmt(l?.temperatura)}{l?.temperatura!=null&&' °C'}</td><td>{fmt(l?.umidadeAr)}{l?.umidadeAr!=null&&'%'}</td>
            <td>{l?timeAgo(l.lidoEm):'sem leituras'}</td></tr>)})}</tbody></table></div>}
    </>
  )
}
