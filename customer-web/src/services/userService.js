import api from './api';

export const updateUser = async (userId, data) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

export const addAddress = async (userId, addressData) => {
  const response = await api.post(`/users/${userId}/addresses`, addressData);
  return response.data;
};
