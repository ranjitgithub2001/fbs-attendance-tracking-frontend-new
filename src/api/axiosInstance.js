import axios from 'axios';

// Backend API base (include /api prefix so frontend calls like `/auth/login` map to
// http://localhost:8080/api/auth/login)
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth-related responses globally
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // clear local auth and force login — this is a simple global handler
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // navigate to login page
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;