import api from './api'

export const analyticsService = {
  getAnalytics: async (params = {}) => {
    return await api.get('/analytics', { params })
  },

  getRevenueAnalytics: async (params = {}) => {
    return await api.get('/analytics/revenue', { params })
  },

  getOrdersAnalytics: async (params = {}) => {
    return await api.get('/analytics/orders', { params })
  },

  getVendorPerformance: async (params = {}) => {
    return await api.get('/analytics/vendors', { params })
  },

  getDriverPerformance: async (params = {}) => {
    return await api.get('/analytics/drivers', { params })
  },

  exportReport: async (type, params = {}) => {
    return await api.get(`/analytics/export/${type}`, { 
      params,
      responseType: 'blob'
    })
  },
}
