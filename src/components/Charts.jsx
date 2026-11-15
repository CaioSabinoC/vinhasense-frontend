import React from 'react'
import { ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, Legend } from 'recharts'

const C={moisture:'#7A2540',temp:'#B7791F',irrig:'#4C7A3F',band:'#4C7A3F'}

export function HistoryChart({data,th,showIrrigation=false,height=300}){
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{top:8,right:8,left:-14,bottom:0}}>
        <CartesianGrid stroke="var(--border)" vertical={false}/>
        <XAxis dataKey="t" tick={{fontSize:12,fill:'var(--muted)'}} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24}/>
        <YAxis yAxisId="m" tick={{fontSize:12,fill:'var(--muted)'}} tickLine={false} axisLine={false} unit="%" domain={[0,50]}/>
        <YAxis yAxisId="t" orientation="right" hide domain={[15,45]}/>
        {th&&<ReferenceArea yAxisId="m" y1={th.mMin} y2={th.mMax} fill={C.band} fillOpacity={0.08} label={{value:'faixa definida por você',position:'insideTopLeft',fontSize:11,fill:'var(--muted)'}}/>}
        {showIrrigation&&<Bar yAxisId="m" dataKey="irrigation" name="Irrigação" fill={C.irrig} fillOpacity={0.35} barSize={8}/>}
        <Area yAxisId="m" type="monotone" dataKey="moisture" name="Umidade do solo (%)" stroke={C.moisture} strokeWidth={2.5} fill={C.moisture} fillOpacity={0.12}/>
        <Line yAxisId="t" type="monotone" dataKey="temp" name="Temp. do solo (°C)" stroke={C.temp} strokeWidth={2.5} strokeDasharray="6 4" dot={false}/>
        <Tooltip contentStyle={{borderRadius:12,border:'1px solid var(--border)',background:'var(--card)',color:'var(--text)'}}/>
        <Legend iconType="plainline" wrapperStyle={{fontSize:12.5}}/>
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function Spark({data,color=C.moisture}){
  return (
    <ResponsiveContainer width="100%" height={36}>
      <ComposedChart data={data}><Area type="monotone" dataKey="moisture" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.12} dot={false}/></ComposedChart>
    </ResponsiveContainer>
  )
}
