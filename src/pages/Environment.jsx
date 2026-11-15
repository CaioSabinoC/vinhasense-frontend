import React from 'react'
import { Thermometer, Droplets, Sun, CloudRain, Zap, Waves, Bug } from 'lucide-react'
import { Header } from '../components/ui.jsx'

const cards=[
  [Thermometer,'Temperatura do ar','32,4','°C'],[Droplets,'Umidade relativa','41','%'],[Sun,'Radiação solar','842','W/m²'],
  [CloudRain,'Precipitação (24h)','0,0','mm'],[Zap,'Condutividade elétrica do solo','1,2','dS/m'],[Waves,'Vazão da irrigação','3,8','m³/h'],[Bug,'Índice de risco de pragas','Baixo','']]

export default function Environment(){
  return (
    <>
      <Header title="Ambiente e pragas" sub="Fase 2 — prévia do layout com dados de exemplo"><span className="chip beta">Em breve</span></Header>
      <div className="notice mb">Estes indicadores serão adicionados em etapas futuras. O primeiro protótipo monitora umidade e temperatura do solo.</div>
      <div className="grid g3">
        {cards.map(([I,l,v,u])=>(
          <div className="card stat soon" key={l}>
            <span className="chip beta ribbon">Em breve</span>
            <div className="label"><span className="icon-badge"><I size={17}/></span>{l}</div>
            <div className="value">{v}<small>{u}</small></div>
            <div className="delta">dados de exemplo</div>
          </div>))}
      </div>
    </>
  )
}
