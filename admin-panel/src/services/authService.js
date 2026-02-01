import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/admin/profile')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },
}
