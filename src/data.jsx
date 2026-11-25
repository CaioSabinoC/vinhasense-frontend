import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api } from './lib/api.js'

// Dados compartilhados pelo painel, lidos do banco via API e atualizados a cada minuto:
// safras (com previsão calculada), sensores (dispositivos) e a última leitura de cada canal.
const Ctx = createContext()
export const useData = () => useContext(Ctx)

const REFRESH_MS = 60 * 1000

export function DataProvider({ children }) {
  const [state, setState] = useState({ safras: [], dispositivos: [], ultimas: {}, loading: true, error: null, syncedAt: null })
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])

  const reload = useCallback(async () => {
    try {
      const [safras, dispositivos, ultimas] = await Promise.all([
        api('/safras/painel'), api('/dispositivos'), api('/leituras/ultimas'),
      ])
      if (!alive.current) return
      setState({
        safras, dispositivos, loading: false, error: null, syncedAt: new Date(),
        ultimas: Object.fromEntries(ultimas.map(l => [l.canalId, l])),
      })
    } catch (error) {
      if (alive.current) setState(s => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    reload()
    const t = setInterval(reload, REFRESH_MS)
    return () => clearInterval(t)
  }, [reload])

  return <Ctx.Provider value={{ ...state, reload }}>{children}</Ctx.Provider>
}
