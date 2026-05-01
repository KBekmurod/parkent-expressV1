import api from './api'

export const driverService = {
  getDrivers: async (params = {}) => {
    return await api.get('/drivers', { params })
  },

  getDriverById: async (id) => {
    return await api.get(`/drivers/${id}`)
  },

  updateDriver: async (id, data) => {
    return await api.put(`/drivers/${id}`, data)
  },

  // Status o'zgartirish (dropdown orqali)
  updateDriverStatus: async (id, status) => {
    return await api.put(`/drivers/${id}/status`, { status })
  },

  // Tasdiqlash yoki rad etish (admin qaroriga asoslangan)
  approveDriver: async (id, approved, reason = '') => {
    return await api.put(`/admin/drivers/${id}/approve`, { approved, reason })
  },

  deleteDriver: async (id) => {
    return await api.delete(`/drivers/${id}`)
  },
}
