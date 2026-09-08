import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { registerUserSocket, unregisterUserSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('foodiehub_token'));
  const [loading, setLoading] = useState(true);

  // Sync socket connection whenever user state updates
  useEffect(() => {
    if (user?._id) {
      registerUserSocket(user._id, user.role);
    }
  }, [user]);

  // Initialize auth from token & fetch fresh user profile

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('foodiehub_token');
      const storedUser = localStorage.getItem('foodiehub_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('foodiehub_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: loggedInUser } = res.data;

      setToken(receivedToken);
      setUser(loggedInUser);

      localStorage.setItem('foodiehub_token', receivedToken);
      localStorage.setItem('foodiehub_user', JSON.stringify(loggedInUser));

      return { success: true, user: loggedInUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: receivedToken, user: registeredUser } = res.data;

      setToken(receivedToken);
      setUser(registeredUser);

      localStorage.setItem('foodiehub_token', receivedToken);
      localStorage.setItem('foodiehub_user', JSON.stringify(registeredUser));

      return { success: true, user: registeredUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      if (!user?._id) throw new Error('You must be logged in to update profile');
      const res = await api.put(`/users/${user._id}`, profileData);
      const updatedUser = res.data.user;

      setUser(updatedUser);
      localStorage.setItem('foodiehub_user', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    unregisterUserSocket();
    setUser(null);
    setToken(null);
    localStorage.removeItem('foodiehub_token');
    localStorage.removeItem('foodiehub_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
