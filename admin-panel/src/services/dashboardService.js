import api from './api'

export const dashboardService = {
  getStats: async () => {
    return await api.get('/stats/admin')
  },

  getOrdersChartData: async (days = 7) => {
    return await api.get(`/stats/admin/orders-chart?days=${days}`)
  },

  getRevenueChartData: async (months = 6) => {
    return await api.get(`/stats/admin/revenue-chart?months=${months}`)
  },
}
