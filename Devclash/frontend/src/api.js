import axios from 'axios';

// The baseUrl is proxied to http://localhost:3000 via vite.config.js
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial for JWT cookies cross-origin / cross-domain parsing
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access, redirecting to login.");
      // If we encounter a strictly 401 unauth, clear local storage and force login logic
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
