import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password })
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
