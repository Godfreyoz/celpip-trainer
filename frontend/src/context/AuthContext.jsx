import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      API.get('/auth/me/')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.clear(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login/', { email, password })
    localStorage.setItem('access', data.tokens.access)
    localStorage.setItem('refresh', data.tokens.refresh)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await API.post('/auth/logout/', { refresh: localStorage.getItem('refresh') }) } catch {}
    localStorage.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    const { data } = await API.get('/auth/me/')
    setUser(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
