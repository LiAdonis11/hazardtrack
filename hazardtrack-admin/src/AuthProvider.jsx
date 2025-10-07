import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    console.log('AuthProvider useEffect - token:', token);
    console.log('AuthProvider useEffect - userData:', userData);

    if (token && userData) {
      setUser(JSON.parse(userData));
      console.log('AuthProvider useEffect - user set');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log('AuthProvider login called with userData:', userData, 'token:', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
