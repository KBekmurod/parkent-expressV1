import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductsByVendor = async (vendorId) => {
  const response = await api.get('/products', { params: { vendor: vendorId } });
  return response.data;
};
