import React, { useState, useEffect } from 'react';
import { AuthContext } from './authContext';
import { authService } from '../services/api';

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const normalized = {
              ...parsedUser,
              _id: parsedUser._id || parsedUser.id,
              id: parsedUser.id || parsedUser._id,
              userType: (parsedUser.userType || '').toLowerCase()
            };
            
            // Optionally verify token validity with backend
            setToken(storedToken);
            setUser(normalized);
          } catch {
            // Clear invalid data if parsing fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.token && response.user) {
        const normalized = { 
          ...response.user, 
          _id: response.user._id || response.user.id, 
          id: response.user.id || response.user._id,
          userType: (response.user.userType || '').toLowerCase()
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(normalized));
        setToken(response.token);
        setUser(normalized);
        return { success: true };
      } else {
        const msg = response.message || response.msg || response.error || 'Login failed';
        return { success: false, message: msg };
      }
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.token && response.user) {
        const normalized = { 
          ...response.user, 
          _id: response.user._id || response.user.id, 
          id: response.user.id || response.user._id,
          userType: (response.user.userType || '').toLowerCase()
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(normalized));
        setToken(response.token);
        setUser(normalized);
        return { success: true };
      } else {
        const msg = response.message || response.msg || response.error || 'Registration failed';
        return { success: false, message: msg };
      }
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !loading && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
