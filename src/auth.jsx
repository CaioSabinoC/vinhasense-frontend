import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, session, setUnauthorizedHandler, tokenExpiraEm } from './lib/api.js'

/* ============================================================
   AUTENTICAÇÃO REAL — back-end Parreiral (senha + OTP/TOTP)
   1) POST /auth/login           -> token parcial (não acessa a API)
   2) POST /auth/otp/verificar   -> token de acesso (60 min)
   Primeiro acesso: /auth/registrar (ou login de conta sem OTP) devolve o QR Code;
   /auth/otp/confirmar ativa o OTP e entrega os 10 códigos de recuperação.
   ============================================================ */
export const authApi = {
  registrar: (email, senha) => api('/auth/registrar', { method: 'POST', body: { email, senha }, token: null }),
  login: (email, senha) => api('/auth/login', { method: 'POST', body: { email, senha }, token: null }),
  confirmarOtp: (tokenParcial, codigo) => api('/auth/otp/confirmar', { method: 'POST', body: { codigo }, token: tokenParcial }),
  verificarOtp: (tokenParcial, corpo) => api('/auth/otp/verificar', { method: 'POST', body: corpo, token: tokenParcial }),
}

const AuthCtx = createContext()
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = session.token()
    return token ? { token, email: session.email() } : null
  })

  const signOut = useCallback(() => { session.clear(); setAuth(null) }, [])
  const signIn = (token, email) => { session.save(token, email); setAuth({ token, email }) }

  // Token vencido ou rejeitado pela API -> volta ao login
  useEffect(() => { setUnauthorizedHandler(signOut) }, [signOut])
  useEffect(() => {
    if (!auth) return
    const exp = tokenExpiraEm(auth.token)
    if (!exp) return
    const t = setTimeout(signOut, Math.max(0, exp - Date.now()))
    return () => clearTimeout(t)
  }, [auth, signOut])

  return <AuthCtx.Provider value={{ user: auth, signIn, signOut }}>{children}</AuthCtx.Provider>
}

export function RequireAuth({ children }) {
  const { user } = useAuth()
  const loc = useLocation()
  return user ? children : <Navigate to="/login" replace state={{ from: loc.pathname }} />
}
