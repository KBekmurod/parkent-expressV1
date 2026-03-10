'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';
import { webLogin, webRegister } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, pin) => {
    const data = await webLogin({ phone, pin });
    const { user: userData, token: userToken } = data.data;
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const register = async (phone, pin, firstName, lastName) => {
    const data = await webRegister({ phone, pin, firstName, lastName });
    const { user: userData, token: userToken } = data.data;
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    toast.success("Chiqish muvaffaqiyatli");
  };

  const updateUserData = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserData, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
};
