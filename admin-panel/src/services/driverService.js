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

  updateDriverStatus: async (id, status) => {
    return await api.put(`/drivers/${id}/status`, { status })
  },

  deleteDriver: async (id) => {
    return await api.delete(`/drivers/${id}`)
  },
}
