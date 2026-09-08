import axios from 'axios';

// Base API instance
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodiehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If unauthorized / token expired
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('foodiehub_token');
        localStorage.removeItem('foodiehub_user');
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'A network error occurred. Please check your connection.';

    return Promise.reject(new Error(message));
  }
);

export default api;
