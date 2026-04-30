import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

// VITE_ADMIN_BYPASS=true bo'lsa parolsiz kirish
const BYPASS = import.meta.env.VITE_ADMIN_BYPASS === 'true'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // Bypass rejimi — sahifa ochilishi bilanoq avtomatik login
      if (BYPASS) {
        try {
          const response = await authService.login('', '')
          setUser(response.data.admin)
          localStorage.setItem('token', response.data.token)
        } catch (err) {
          console.error('Bypass login xatosi:', err)
        } finally {
          setLoading(false)
        }
        return
      }

      // Oddiy rejim — saqlangan token tekshiruvi
      const token = localStorage.getItem('token')
      if (token) {
        authService.getProfile()
          .then(response => setUser(response.data.admin))
          .catch(() => localStorage.removeItem('token'))
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    setUser(response.data.admin)
    localStorage.setItem('token', response.data.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
