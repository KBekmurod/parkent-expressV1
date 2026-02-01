import api from './api'

export const orderService = {
  getOrders: async (params = {}) => {
    return await api.get('/orders', { params })
  },

  getOrderById: async (id) => {
    return await api.get(`/orders/${id}`)
  },

  updateOrderStatus: async (id, status) => {
    return await api.put(`/orders/${id}/status`, { status })
  },

  assignDriver: async (id, driverId) => {
    return await api.put(`/orders/${id}/assign-driver`, { driver: driverId })
  },
}
