// Cliente da API do VinhaSense (back-end Parreiral).
// Em produção o Nginx recebe /api/* e encaminha ao Node. Em dev, o Vite faz o proxy (vite.config.js).
// Para apontar para outro endereço, defina VITE_API_URL no build (ex.: https://api.exemplo.com).
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const TOKEN_KEY = 'vinhasense.token'
const EMAIL_KEY = 'vinhasense.email'

// sessionStorage: o token some ao fechar a aba (o token de acesso dura só 60 min mesmo)
const store = {
  get: k => { try { return sessionStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { sessionStorage.setItem(k, v) } catch {} },
  del: k => { try { sessionStorage.removeItem(k) } catch {} },
}

export const session = {
  token: () => store.get(TOKEN_KEY),
  email: () => store.get(EMAIL_KEY),
  save: (token, email) => { store.set(TOKEN_KEY, token); if (email) store.set(EMAIL_KEY, email) },
  clear: () => { store.del(TOKEN_KEY); store.del(EMAIL_KEY) },
}

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = fn => { onUnauthorized = fn }

// token: usado só nas etapas do OTP (token parcial). Sem ele, usa o token de acesso da sessão.
export async function api(path, { method = 'GET', body, token, query } = {}) {
  const usaSessao = token === undefined
  const jwt = usaSessao ? session.token() : token
  let url = BASE + path
  if (query) {
    const qs = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v) })
    const s = qs.toString()
    if (s) url += '?' + s
  }
  let res
  try {
    res = await fetch(url, {
      method,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão.', 0)
  }
  let data = null
  try { data = await res.json() } catch { /* sem corpo */ }
  if (!res.ok) {
    // 401 com a sessão ativa = token expirado/inválido: volta para o login
    if (res.status === 401 && usaSessao && jwt) onUnauthorized()
    throw new ApiError(data?.erro || `Erro ${res.status}`, res.status)
  }
  return data
}

// Lê a expiração (exp, em ms) do JWT, só para deslogar sozinho quando vencer
export function tokenExpiraEm(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp ? payload.exp * 1000 : null
  } catch { return null }
}
