// Funções puras que transformam dados REAIS da API em o que a tela mostra
// (status, alertas, formatação). Nada aqui inventa valores.

export const statusLabel = { ok: 'Normal', warn: 'Atenção', crit: 'Crítico', off: 'Offline' }

export const fmt = (v, d = 1) => (v == null || Number.isNaN(v) ? '—' : Number(v).toFixed(d).replace('.', ','))
export const fmtKg = v => (v == null ? '—' : Math.round(v).toLocaleString('pt-BR'))
export const fmtDate = d => (d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'America/Recife' }) : '—')
export const fmtDateTime = d => (d ? new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Recife', dateStyle: 'short', timeStyle: 'short' }) : '—')

export function timeAgo(d, now = Date.now()) {
  if (!d) return 'sem leituras'
  const s = Math.max(0, Math.round((now - new Date(d).getTime()) / 1000))
  if (s < 60) return 'agora há pouco'
  const m = Math.round(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.round(m / 60)
  if (h < 48) return `há ${h} h`
  return `há ${Math.round(h / 24)} dias`
}

// Sensor online = última leitura dentro de 3x o intervalo configurado (mínimo 2 min)
export function deviceOnline(dispositivo, leitura, now = Date.now()) {
  if (!leitura) return false
  const limiteMs = Math.max((dispositivo?.intervaloSegundos || 60) * 3, 120) * 1000
  return now - new Date(leitura.lidoEm).getTime() <= limiteMs
}

export const deviceStatus = (d, leitura, now) => (deviceOnline(d, leitura, now) ? 'ok' : 'off')

// Canais que alimentam uma safra: o canal dela, ou todos os sensores do usuário se ela não tiver canal
export const canaisDaSafra = (safra, dispositivos) =>
  safra.canalId ? [safra.canalId] : dispositivos.map(d => d.canalId)

// Leitura mais recente entre os canais da safra
export function leituraDaSafra(safra, dispositivos, ultimas) {
  const canais = canaisDaSafra(safra, dispositivos)
  return canais.map(c => ultimas[c]).filter(Boolean)
    .sort((a, b) => new Date(b.lidoEm) - new Date(a.lidoEm))[0] || null
}

// Status da safra a partir da leitura atual e dos limites definidos pelo produtor
export function statusDaSafra(safra, dispositivos, ultimas, th, now) {
  const l = leituraDaSafra(safra, dispositivos, ultimas)
  const disp = l && dispositivos.find(d => d.canalId === l.canalId)
  if (!l || !deviceOnline(disp, l, now)) return 'off'
  if (l.umidadeSolo != null && (l.umidadeSolo < th.mMin || l.umidadeSolo > th.mMax)) return 'crit'
  if (l.temperatura != null && (l.temperatura < th.tMin || l.temperatura > th.tMax)) return 'warn'
  return 'ok'
}

// Alertas calculados em tempo real: leitura atual fora das faixas + sensores sem comunicação
export function derivarAlertas(safras, dispositivos, ultimas, th, now = Date.now()) {
  const out = []
  safras.filter(s => s.status === 'ativa').forEach(s => {
    const l = leituraDaSafra(s, dispositivos, ultimas)
    const disp = l && dispositivos.find(d => d.canalId === l.canalId)
    if (!l || !deviceOnline(disp, l, now)) return
    const base = { safraId: s._id, safra: s.nome, quando: l.lidoEm }
    if (l.umidadeSolo != null && l.umidadeSolo < th.mMin)
      out.push({ ...base, id: `${s._id}-m-min`, level: 'crit', type: 'Umidade abaixo da faixa', msg: `Umidade do solo ${fmt(l.umidadeSolo)}% — abaixo do mínimo configurado (${th.mMin}%).` })
    if (l.umidadeSolo != null && l.umidadeSolo > th.mMax)
      out.push({ ...base, id: `${s._id}-m-max`, level: 'crit', type: 'Umidade acima da faixa', msg: `Umidade do solo ${fmt(l.umidadeSolo)}% — acima do máximo configurado (${th.mMax}%).` })
    if (l.temperatura != null && l.temperatura > th.tMax)
      out.push({ ...base, id: `${s._id}-t-max`, level: 'warn', type: 'Temperatura acima da faixa', msg: `Temperatura ${fmt(l.temperatura)} °C — acima do máximo configurado (${th.tMax} °C).` })
    if (l.temperatura != null && l.temperatura < th.tMin)
      out.push({ ...base, id: `${s._id}-t-min`, level: 'warn', type: 'Temperatura abaixo da faixa', msg: `Temperatura ${fmt(l.temperatura)} °C — abaixo do mínimo configurado (${th.tMin} °C).` })
  })
  dispositivos.forEach(d => {
    const l = ultimas[d.canalId]
    if (deviceOnline(d, l, now)) return
    out.push({
      id: `${d._id}-off`, level: 'off', type: 'Sensor offline', dispositivoId: d._id, safra: null,
      quando: l?.lidoEm || null,
      msg: l ? `${d.nome} sem comunicação ${timeAgo(l.lidoEm, now)}.` : `${d.nome} ainda não enviou nenhuma leitura (canal ${d.canalId}).`,
    })
  })
  const ordem = { crit: 0, warn: 1, off: 2 }
  return out.sort((a, b) => ordem[a.level] - ordem[b.level])
}

// ---------- séries para gráficos ----------
export const RANGES = {
  '24h': { ms: 24 * 3600e3, bucket: 'hora' },
  '7d': { ms: 7 * 24 * 3600e3, bucket: 'hora' },
  '30d': { ms: 30 * 24 * 3600e3, bucket: 'dia' },
}

const fmtHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife', hour: '2-digit', hour12: false })
const fmtDiaHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife', day: '2-digit', month: '2-digit', hour: '2-digit', hour12: false })
const fmtDia = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife', day: '2-digit', month: '2-digit' })

export function rotulo(date, range) {
  const d = new Date(date)
  if (range === '24h') return `${fmtHora.format(d)}h`
  if (range === '7d') return fmtDiaHora.format(d).replace(', ', ' ').replace(/(\d+)$/, '$1h')
  return fmtDia.format(d)
}

// Converte as linhas da API em pontos do gráfico
export const paraGrafico = (linhas, range) => linhas.map(l => ({
  ts: l.t, t: rotulo(l.t, range),
  moisture: l.umidadeSolo, temp: l.temperatura, air: l.umidadeAr,
}))
