import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getCustomerOrders = async (userId) => {
  const response = await api.get(`/orders/customer/${userId}`);
  return response.data;
};
