import api from './api'

export const analyticsService = {
  // Asosiy analytics — /stats/analytics ga yo'naltirish
  getAnalytics: async (params = {}) => {
    return await api.get('/stats/analytics', { params })
  },

  getRevenueAnalytics: async (params = {}) => {
    return await api.get('/stats/revenue', { params })
  },

  getOrdersAnalytics: async (params = {}) => {
    return await api.get('/stats/orders', { params })
  },
}
