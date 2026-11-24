// Dados fictícios para o protótipo. Troque por chamadas à API/banco quando o back-end existir.
function rng(seed){let s=seed;return()=>((s=(s*9301+49297)%233280)/233280)}

export const plots = [
  {id:'t01',name:'Safra 01',variety:'Syrah',rootstock:'SO4',planted:'2019-03-12',stage:'Maturação',moisture:27.8,temp:31.2,status:'ok',sensors:['s01','s02']},
  {id:'t02',name:'Safra 02',variety:'Cabernet Sauvignon',rootstock:'Paulsen 1103',planted:'2018-09-02',stage:'Floração',moisture:19.4,temp:33.8,status:'warn',sensors:['s03','s04']},
  {id:'t03',name:'Safra 03',variety:'Touriga Nacional',rootstock:'IAC 572',planted:'2020-01-20',stage:'Frutificação',moisture:12.1,temp:35.6,status:'crit',sensors:['s05']},
  {id:'t04',name:'Safra 04',variety:'Chenin Blanc',rootstock:'SO4',planted:'2017-06-30',stage:'Poda',moisture:30.2,temp:29.9,status:'ok',sensors:['s06','s07']},
  {id:'t05',name:'Safra 05',variety:'Tempranillo',rootstock:'Paulsen 1103',planted:'2021-04-08',stage:'Brotação',moisture:null,temp:null,status:'off',sensors:['s08']},
  {id:'t06',name:'Safra 06',variety:'Syrah',rootstock:'IAC 572',planted:'2022-02-14',stage:'Maturação',moisture:25.6,temp:30.4,status:'ok',sensors:['s09']},
]

// Previsão de colheita (FICTÍCIA): área (ha) x produtividade esperada (kg/ha).
// Troque por dados reais/API quando existir. forecastKg = areaHa * kgHa.
const forecastData={
  t01:{areaHa:4.2,kgHa:17500,harvestDate:'2026-12-10',confidence:'Alta'},
  t02:{areaHa:3.1,kgHa:14200,harvestDate:'2027-01-18',confidence:'Média'},
  t03:{areaHa:2.4,kgHa:9800,harvestDate:'2027-01-30',confidence:'Baixa'},
  t04:{areaHa:5.0,kgHa:16000,harvestDate:'2027-02-12',confidence:'Média'},
  t05:{areaHa:1.8,kgHa:12000,harvestDate:'2027-03-05',confidence:'Baixa'},
  t06:{areaHa:2.6,kgHa:18200,harvestDate:'2026-12-20',confidence:'Alta'},
}
plots.forEach(p=>{const f=forecastData[p.id];Object.assign(p,f,{forecastKg:Math.round(f.areaHa*f.kgHa)})})
export const totalForecastKg=()=>plots.reduce((a,p)=>a+p.forecastKg,0)
export const fmtKg=v=>Math.round(v).toLocaleString('pt-BR')

export const sensors = [
  {id:'s01',device:'ESP32-A1F3',plot:'t01',depth:'30 cm',battery:86,signal:-61,last:'há 2 min',status:'ok'},
  {id:'s02',device:'ESP32-A1F4',plot:'t01',depth:'60 cm',battery:79,signal:-67,last:'há 2 min',status:'ok'},
  {id:'s03',device:'ESP32-B2C1',plot:'t02',depth:'30 cm',battery:64,signal:-72,last:'há 3 min',status:'warn'},
  {id:'s04',device:'ESP32-B2C2',plot:'t02',depth:'60 cm',battery:58,signal:-70,last:'há 3 min',status:'warn'},
  {id:'s05',device:'ESP32-C9D0',plot:'t03',depth:'30 cm',battery:22,signal:-80,last:'há 5 min',status:'crit'},
  {id:'s06',device:'ESP32-D7E5',plot:'t04',depth:'30 cm',battery:91,signal:-58,last:'há 1 min',status:'ok'},
  {id:'s07',device:'ESP32-D7E6',plot:'t04',depth:'60 cm',battery:88,signal:-60,last:'há 1 min',status:'ok'},
  {id:'s08',device:'ESP32-E4A8',plot:'t05',depth:'30 cm',battery:3,signal:null,last:'há 2 dias',status:'off'},
  {id:'s09',device:'ESP32-F0B2',plot:'t06',depth:'30 cm',battery:74,signal:-64,last:'há 2 min',status:'ok'},
]

export const alerts = [
  {id:1,level:'crit',type:'Umidade abaixo da faixa',plot:'t03',msg:'Umidade 12,1% — abaixo do mínimo configurado (18%).',when:'há 25 min',state:'aberto'},
  {id:2,level:'crit',type:'Bateria baixa',plot:'t03',msg:'Sensor ESP32-C9D0 com 22% de bateria.',when:'há 1 h',state:'aberto'},
  {id:3,level:'warn',type:'Temperatura acima da faixa',plot:'t02',msg:'Temperatura do solo 33,8 °C — acima do máximo configurado (33 °C).',when:'há 2 h',state:'aberto'},
  {id:4,level:'off',type:'Sensor offline',plot:'t05',msg:'ESP32-E4A8 sem comunicação há 2 dias.',when:'há 2 dias',state:'aberto'},
  {id:5,level:'warn',type:'Umidade próxima do mínimo',plot:'t02',msg:'Umidade 19,4% — próxima do limite inferior.',when:'ontem',state:'resolvido'},
  {id:6,level:'beta',type:'Risco de praga (beta)',plot:'t01',msg:'Condição favorável a oídio nos próximos dias (estimativa experimental).',when:'ontem',state:'aberto'},
]

export const plotById = id => plots.find(p=>p.id===id)

// Série temporal de umidade/temperatura do solo + irrigação
export function series(seed, hours=24, baseM=26, baseT=30){
  const r=rng(seed), out=[]
  for(let i=0;i<hours;i++){
    const h=i%24
    const irrig = (h===5||h===17) ? 1 : 0
    const m = baseM + Math.sin(i/5)*2.2 - (h>10&&h<16?1.2:0) + irrig*3.5 + (r()-.5)*1.2
    const t = baseT + Math.sin((h-9)/24*Math.PI*2)*3 + (r()-.5)*.6
    out.push({t: hours<=48 ? `${String(h).padStart(2,'0')}h` : `D${Math.floor(i/24)+1}`, moisture:+m.toFixed(1), temp:+t.toFixed(1), irrigation: irrig? 8:0})
  }
  return out
}
export const ranges = {'24h':24,'7d':7*24,'30d':30*24}
export function seriesFor(plotId, range){
  const p=plotById(plotId)||plots[0]
  const n=ranges[range]||24
  const s = series(plotId.charCodeAt(2)*7, n, p.moisture||20, p.temp||30)
  if(n<=24) return s
  // agrega por dia para 7d / 30d
  const days=[]
  for(let d=0;d<n/24;d++){
    const sl=s.slice(d*24,d*24+24)
    days.push({t:`D${d+1}`,moisture:+(sl.reduce((a,x)=>a+x.moisture,0)/24).toFixed(1),temp:+(sl.reduce((a,x)=>a+x.temp,0)/24).toFixed(1),irrigation:sl.some(x=>x.irrigation)?8:0})
  }
  return days
}
export const statusLabel={ok:'Normal',warn:'Atenção',crit:'Crítico',off:'Offline',beta:'Beta'}
