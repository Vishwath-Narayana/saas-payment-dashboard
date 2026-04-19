import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth.api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load — verify session
  useEffect(() => {
    authAPI.getMe()
      .then(res => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (data) => {
    const res = await authAPI.login(data)
    setUser(res.data.data.user)
    return res.data.data.user
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
