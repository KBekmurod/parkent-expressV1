import api from './api';

export const webLogin = async ({ phone, pin }) => {
  const response = await api.post('/auth/web/login', { phone, pin });
  return response.data;
};

export const webRegister = async ({ phone, pin, firstName, lastName }) => {
  const response = await api.post('/auth/web/register', { phone, pin, firstName, lastName });
  return response.data;
};
