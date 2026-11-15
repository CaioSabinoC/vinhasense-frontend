import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Droplets, Thermometer, Radio, BellRing, RefreshCw } from 'lucide-react'
import { Header, Stat, Chip, Seg, fmt } from '../components/ui.jsx'
import { HistoryChart } from '../components/Charts.jsx'
import { plots, sensors, alerts, seriesFor, plotById, totalForecastKg, fmtKg } from '../data/mock.js'
import { useThresholds } from '../App.jsx'

export default function Dashboard(){
  const [range,setRange]=useState('24h')
  const nav=useNavigate()
  const { th } = useThresholds()
  const live=plots.filter(p=>p.moisture!=null)
  const avgM=live.reduce((a,p)=>a+p.moisture,0)/live.length
  const avgT=live.reduce((a,p)=>a+p.temp,0)/live.length
  const online=sensors.filter(s=>s.status!=='off').length
  const open=alerts.filter(a=>a.state==='aberto')
  return (
    <>
      <Header title="Dashboard" sub="Fazenda Santa Clara — Lagoa Grande, PE">
        <select className="input" style={{width:230}} aria-label="Propriedade"><option>Fazenda Santa Clara</option><option>Sítio Boa Vista — Casa Nova</option></select>
        <Seg value={range} onChange={setRange} options={['24h','7d','30d']}/>
        <span className="chip off"><RefreshCw size={13}/>Sincronizado há 2 min</span>
      </Header>

      <div className="grid g4">
        <Stat icon={Droplets} label="Umidade média do solo" value={fmt(avgM)} unit="%" note="média das safras online"/>
        <Stat icon={Thermometer} label="Temperatura média do solo" value={fmt(avgT)} unit="°C" note="média das safras online"/>
        <Stat icon={Radio} label="Sensores online" value={`${online}/${sensors.length}`} note={`${sensors.length-online} offline`}/>
        <Stat icon={BellRing} label="Alertas abertos" value={open.length} note={`${open.filter(a=>a.level==='crit').length} críticos`}/>
      </div>

      <div className="card mt">
        <div className="row between mb wrap">
          <div><h2>Previsão de colheita</h2><div className="sub">Estimativa de uvas a colher, por safra</div></div>
          <div style={{textAlign:'right'}}><div className="muted" style={{fontSize:12.5}}>Total previsto</div><b style={{fontSize:30}}>{fmtKg(totalForecastKg())}</b> <span className="muted">kg</span></div>
        </div>
        {plots.map(p=>(
          <Link to={`/safras/${p.id}`} className="forecast-row" key={p.id}>
            <div><b>{p.name}</b><div className="muted" style={{fontSize:13}}>{p.variety} · {fmt(p.areaHa)} ha</div></div>
            <div className="bar" aria-hidden="true"><i style={{width:(p.forecastKg/Math.max(...plots.map(x=>x.forecastKg))*100)+'%'}}/></div>
            <div style={{textAlign:'right'}}><b>{fmtKg(p.forecastKg)} kg</b><div className="muted" style={{fontSize:13}}>colheita ~ {new Date(p.harvestDate).toLocaleDateString('pt-BR')} · confiança {p.confidence.toLowerCase()}</div></div>
          </Link>))}
        <div className="muted" style={{fontSize:12.5,marginTop:10}}>Dados de exemplo (área × produtividade esperada).</div>
      </div>

      <div className="grid g-main mt">
        <div className="card">
          <div className="row between mb"><h2>Umidade e temperatura — Safra 01</h2><Link to="/safras/t01" className="btn sm">Ver safra</Link></div>
          <HistoryChart data={seriesFor('t01',range)} th={th}/>
        </div>
        <div className="card">
          <h2 className="mb">Mapa da propriedade</h2>
          <div className="map" aria-label="Esquema das safras">
            {plots.map(p=>(
              <div key={p.id} className={`plot-tile ${p.status}`} onClick={()=>nav(`/safras/${p.id}`)} role="link" tabIndex={0}>
                <span>{p.name}</span><b>{p.moisture!=null?fmt(p.moisture)+'%':'offline'}</b><span style={{opacity:.9}}>{p.variety}</span>
              </div>))}
          </div>
          <div className="legend"><span><i className="dot ok"/>Normal</span><span><i className="dot warn"/>Atenção</span><span><i className="dot crit"/>Crítico</span><span><i className="dot off"/>Offline</span></div>
        </div>
      </div>

      <div className="card mt">
        <div className="row between"><h2>Últimos alertas</h2><Link to="/alertas" className="btn sm">Ver todos</Link></div>
        {open.slice(0,4).map(a=>(
          <div className="list-item" key={a.id}>
            <i className={`dot ${a.level==='beta'?'warn':a.level}`}/>
            <div style={{flex:1}}><b>{a.type}</b> <span className="muted">· {plotById(a.plot).name}</span><div className="muted" style={{fontSize:13.5}}>{a.msg}</div></div>
            <span className="muted" style={{fontSize:13,whiteSpace:'nowrap'}}>{a.when}</span>
          </div>))}
      </div>
    </>
  )
}
