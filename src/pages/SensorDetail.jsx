import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Header, Chip, fmt } from '../components/ui.jsx'
import { sensors, plotById, series } from '../data/mock.js'

export default function SensorDetail(){
  const { id }=useParams()
  const s=sensors.find(x=>x.id===id)
  if(!s) return <div className="empty">Sensor não encontrado.</div>
  const p=plotById(s.plot)
  const rows=series(s.id.charCodeAt(2),50,p.moisture||20,p.temp||30).slice(-50).reverse()
  return (
    <>
      <Header title={s.device} sub={`${p.name} · profundidade ${s.depth}`}><Chip s={s.status}/><Link to={`/safras/${p.id}`} className="btn">Ver safra</Link></Header>
      <div className="grid g2 stack">
        <div className="card"><h2 className="mb">Dispositivo</h2>
          <dl className="kv">
            <dt>ID</dt><dd>{s.device}</dd><dt>Modelo</dt><dd>ESP32 + sensor capacitivo de umidade/temperatura</dd>
            <dt>Bateria</dt><dd>{s.battery}%</dd><dt>Sinal Wi-Fi</dt><dd>{s.signal?`${s.signal} dBm`:'sem sinal'}</dd>
            <dt>Última leitura</dt><dd>{s.last}</dd><dt>Intervalo</dt><dd>a cada 10 min</dd></dl></div>
        <div className="card"><h2 className="mb">Calibração e histórico de status</h2>
          <dl className="kv"><dt>Calibrado em</dt><dd>12/08/2026</dd><dt>Seco (ADC)</dt><dd>3120</dd><dt>Molhado (ADC)</dt><dd>1280</dd></dl>
          <div className="list-item mt"><i className="dot ok"/><span>Online desde 03/10 08:12</span></div>
          <div className="list-item"><i className="dot off"/><span>Offline por 40 min em 01/10</span></div></div>
      </div>
      <div className="card mt table-wrap"><h2 className="mb">Últimas 50 leituras</h2>
        <table><thead><tr><th>Hora</th><th>Umidade</th><th>Temperatura</th></tr></thead>
          <tbody>{rows.map((r,i)=><tr key={i}><td>{r.t}</td><td>{fmt(r.moisture)}%</td><td>{fmt(r.temp)} °C</td></tr>)}</tbody></table></div>
    </>
  )
}
