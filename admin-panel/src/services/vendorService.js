import api from './api'

export const vendorService = {
  getVendors: async (params = {}) => {
    return await api.get('/vendors', { params })
  },

  getVendorById: async (id) => {
    return await api.get(`/vendors/${id}`)
  },

  createVendor: async (data) => {
    return await api.post('/vendors/register', data)
  },

  updateVendor: async (id, data) => {
    return await api.put(`/vendors/${id}`, data)
  },

  updateVendorStatus: async (id, status) => {
    return await api.put(`/vendors/${id}/status`, { status })
  },

  deleteVendor: async (id) => {
    return await api.delete(`/vendors/${id}`)
  },
}
