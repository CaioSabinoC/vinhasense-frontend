import React, { createContext, useContext, useEffect, useState } from 'react'

// Limites de alerta definidos PELO PRODUTOR (não existem valores ideais universais).
// Ficam salvos neste navegador; os padrões abaixo são só ponto de partida editável em Configurações.
const KEY = 'vinhasense.limites'
export const LIMITES_PADRAO = { mMin: 18, mMax: 35, tMin: 20, tMax: 33 }

const read = () => {
  try { return { ...LIMITES_PADRAO, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return LIMITES_PADRAO }
}

const Ctx = createContext()
export const useThresholds = () => useContext(Ctx)

export function ThresholdsProvider({ children }) {
  const [th, setThState] = useState(read)
  const setTh = v => { setThState(v); try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }
  return <Ctx.Provider value={{ th, setTh }}>{children}</Ctx.Provider>
}

const THEME_KEY = 'vinhasense.tema'
export function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(THEME_KEY) || 'light' } catch { return 'light' } })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch {}
  }, [theme])
  return [theme, setTheme]
}
