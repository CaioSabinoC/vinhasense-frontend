import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api.js'
import { RANGES, paraGrafico } from './derive.js'

// Executa uma chamada assíncrona e acompanha loading/erro. `deps` refaz a chamada; `interval` atualiza sozinho.
export function useAsync(fn, deps, { interval } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])

  const run = useCallback(async (silent = false) => {
    if (!silent) setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await fnRef.current()
      if (alive.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (alive.current) setState(s => ({ data: silent ? s.data : null, error, loading: false }))
    }
  }, [])

  useEffect(() => {
    run(false)
    if (!interval) return
    const t = setInterval(() => run(true), interval)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, interval])

  return { ...state, reload: () => run(false) }
}

// Série agregada do banco (hora ou dia). canalId vazio = todos os sensores do usuário.
export function useSerie(canalId, range) {
  const r = RANGES[range] || RANGES['24h']
  const { data, error, loading } = useAsync(async () => {
    const fim = new Date()
    const linhas = await api('/leituras/serie', {
      query: { canalId, inicio: new Date(fim.getTime() - r.ms).toISOString(), fim: fim.toISOString(), bucket: r.bucket },
    })
    return paraGrafico(linhas, range)
  }, [canalId, range], { interval: 5 * 60 * 1000 })
  return { rows: data || [], error, loading }
}
