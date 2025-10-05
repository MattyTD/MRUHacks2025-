import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5001';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  useEffect(() => {
    // Listen for changes to localStorage (token) and update state
    const handleStorage = () => {
      const newToken = localStorage.getItem('token');
      if (newToken !== token) {
        setToken(newToken);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [token]);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
          // Only redirect if user is present and not null, and not already on /owner
          if (res.data && res.data._id && window.location.pathname !== '/owner') {
            setTimeout(() => {
              window.location.replace('/owner');
            }, 150);
          }
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          // Only redirect to /login if not already there
          if (window.location.pathname !== '/login') {
            setTimeout(() => {
              window.location.replace('/login');
            }, 150);
          }
        }
      } else {
        // No token, ensure user is null and redirect to login if not already there
        setUser(null);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/verification') {
          setTimeout(() => {
            window.location.replace('/login');
          }, 150);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      // Set axios header immediately
      axios.defaults.headers.common['x-auth-token'] = token;
      // Load user data
      const userRes = await axios.get('/api/auth/me');
      setUser(userRes.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      // Set axios header immediately
      axios.defaults.headers.common['x-auth-token'] = token;
      // Load user data
      const userRes = await axios.get('/api/auth/me');
      setUser(userRes.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed' 
      };
    }
  };

  const logout = () => {
  localStorage.removeItem('token');
  setToken(null);
  setUser(null);
  delete axios.defaults.headers.common['x-auth-token'];
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
