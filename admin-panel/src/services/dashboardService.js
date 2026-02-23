import api from './api'

export const dashboardService = {
  getStats: async () => {
    return await api.get('/stats/dashboard')
  },

  getOrdersChartData: async (days = 7) => {
    return await api.get(`/stats/orders?days=${days}`)
  },

  getRevenueChartData: async (months = 6) => {
    return await api.get(`/stats/revenue?months=${months}`)
  },
}
