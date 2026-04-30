import api from './api'

export const authService = {
  // email va password bo'sh bo'lsa — bypass rejimi (backend ADMIN_BYPASS=true kerak)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response
  },

  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  logout: () => {
    localStorage.removeItem('token')
  },
}
