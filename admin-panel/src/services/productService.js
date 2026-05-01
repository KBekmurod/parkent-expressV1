import api from './api'

export const productService = {
  getProducts: async (params = {}) => {
    return await api.get('/products', { params })
  },

  getProductsByVendor: async (vendorId, params = {}) => {
    return await api.get(`/products/vendor/${vendorId}`, { params })
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

  toggleAvailability: async (id) => {
    return await api.put(`/products/${id}/toggle`)
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`)
  },
}
