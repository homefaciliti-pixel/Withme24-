import axios from 'axios';

// Instantiate Axios with root prefix
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Bearer JWT from LocalStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 errors, attempt token rotation, and sign out on failure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Note: use base axios to avoid infinite loops
        const response = await axios.post('/api/auth/refresh-token', { refreshToken });
        
        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn('[API Interceptor] Token rotation failed. Clearing credentials.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Let AuthContext trigger route redirection
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
