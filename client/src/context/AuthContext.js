import { createContext, useContext, useState, useEffect } from 'react';

import { authService } from '../services/AuthService';
import { userService } from '../services/UserService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await authService.checkAuth();
        setUser(userData);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (email, password, nickname) => {
    await userService.register(email, password, nickname);
  };

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const changePassword = async ({ oldPassword, newPassword }) => {
    const userData = await userService.changePassword(oldPassword, newPassword);
    setUser(userData);
    return userData;
  };

  const delete_ = () => {
    setUser(null);
    userService.deleteAccount();
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    changePassword,
    delete_
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};