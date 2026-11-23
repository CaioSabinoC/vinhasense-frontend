import React, { createContext, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/* ============================================================
   AUTENTICAÇÃO (MOCK) — protótipo sem back-end
   Etapa 1: e-mail + senha  |  Etapa 2: código de 6 dígitos
   Para integrar a API real, troque verifyPassword / verifyCode.
   ============================================================ */
export const DEMO_EMAIL = 'produtor@fazenda.com.br'
export const DEMO_PASSWORD = '123456'
export const DEMO_CODE = '123456'
const KEY = 'vinhasense.session'

const AuthCtx = createContext()
export const useAuth = () => useContext(AuthCtx)

const wait = ms => new Promise(r => setTimeout(r, ms))

// Etapa 1 — valida credenciais e "envia" o código
export async function verifyPassword(email, password){
  await wait(600)
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD)
    throw new Error('E-mail ou senha incorretos.')
  return true
}
// Etapa 2 — valida o código
export async function verifyCode(code){
  await wait(500)
  if (code !== DEMO_CODE) throw new Error('Código inválido. Tente novamente.')
  return true
}
export async function resendCode(){ await wait(400); return true }

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }

export function AuthProvider({ children }){
  const [user, setUser] = useState(read)
  const signIn = (email, remember = true) => {
    const u = { email, at: Date.now() }
    try { localStorage.setItem(KEY, JSON.stringify(u)) } catch {}
    setUser(u)
  }
  const signOut = () => { try { localStorage.removeItem(KEY) } catch {}; setUser(null) }
  return <AuthCtx.Provider value={{ user, signIn, signOut }}>{children}</AuthCtx.Provider>
}

export function RequireAuth({ children }){
  const { user } = useAuth()
  const loc = useLocation()
  return user ? children : <Navigate to="/login" replace state={{ from: loc.pathname }}/>
}
