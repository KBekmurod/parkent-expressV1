import api from './api'

export const productService = {
  getProducts: async (params = {}) => {
    return await api.get('/products', { params })
  },

  getProductById: async (id) => {
    return await api.get(`/products/${id}`)
  },

  createProduct: async (data) => {
    return await api.post('/products', data)
  },

  updateProduct: async (id, data) => {
    return await api.put(`/products/${id}`, data)
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`)
  },

  toggleAvailability: async (id) => {
    return await api.put(`/products/${id}/toggle`)
  },
}
