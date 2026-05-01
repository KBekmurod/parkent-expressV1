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

  // Tasdiqlash yoki rad etish (vendor'ga Telegram xabar boradi)
  approveVendor: async (id, approved, reason = '') => {
    return await api.put(`/admin/vendors/${id}/approve`, { approved, reason })
  },

  deleteVendor: async (id) => {
    return await api.delete(`/vendors/${id}`)
  },
}
