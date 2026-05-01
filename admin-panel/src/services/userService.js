import api from './api'

export const userService = {
  getUsers: async (params = {}) => {
    return await api.get('/users', { params })
  },

  getUserById: async (id) => {
    return await api.get(`/users/${id}`)
  },

  updateUser: async (id, data) => {
    return await api.put(`/users/${id}`, data)
  },

  blockUser: async (id) => {
    return await api.put(`/users/${id}/status`, { status: 'blocked' })
  },

  unblockUser: async (id) => {
    return await api.put(`/users/${id}/status`, { status: 'active' })
  },

  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`)
  },
}
