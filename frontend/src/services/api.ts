import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If frontend is deployed on Vercel, Netlify, or Hostinger separate domain, fallback to live Render backend
  if (typeof window !== 'undefined' && !window.location.hostname.includes('onrender.com') && !window.location.hostname.includes('localhost')) {
    return 'https://withme24-1.onrender.com/api';
  }
  return '/api';
};

// Instantiate Axios with root prefix or live backend URL
const api = axios.create({
  baseURL: getBaseUrl(),
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

export const v1Api = {
  // 1. Auth APIs
  sendOtp: (phone_number: string, country_code = '+91') =>
    api.post('/v1/auth/send-otp', { phone_number, country_code }),
  verifyOtp: (phone_number: string, otp_code: string, country_code = '+91') =>
    api.post('/v1/auth/verify-otp', { phone_number, otp_code, country_code }),
  resendOtp: (phone_number: string, country_code = '+91') =>
    api.post('/v1/auth/resend-otp', { phone_number, country_code }),
  getCountryCodes: () => api.get('/v1/auth/country-codes'),
  getTermsOfService: () => api.get('/v1/auth/terms-of-service'),
  getPrivacyPolicy: () => api.get('/v1/auth/privacy-policy'),

  // 2. Profile & KYC APIs
  getProfile: () => api.get('/v1/profile'),
  editProfile: (data: any) => api.post('/v1/profile/edit', data),
  verifyKyc: (data: { document_type: string; document_number: string; full_name?: string; dob?: string }) =>
    api.post('/v1/kyc/verify', data),

  // 3. Aadhaar APIs
  sendAadhaarOtp: (aadhaar_number: string) =>
    api.post('/v1/aadhaar/send-otp', { aadhaar_number }),
  verifyAadhaarOtp: (ref_id: string, otp: string) =>
    api.post('/v1/aadhaar/otp-verify', { ref_id, otp }),
  uploadAadhaar: (formData: FormData) =>
    api.post('/v1/aadhaar/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // 4. Profile Live APIs
  getViewedInterest: (type?: 'viewers' | 'interests') =>
    api.get(`/v1/profile-live/viewed-interest${type ? `?type=${type}` : ''}`),
  expressInterest: (target_user_id: string, action = 'EXPRESS_INTEREST') =>
    api.post('/v1/profile-live/viewed-interest', { target_user_id, action }),
  uploadPhoto: (formData: FormData) =>
    api.post('/v1/profile-live/photo-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  faceScan: (face_image_base64?: string) =>
    api.post('/v1/profile-live/face-scan', { face_image_base64 }),

  // 5. Activities & Search APIs
  getPlanningToday: () => api.get('/v1/activities/planning-today'),
  searchActivities: (q = '', location = '', category = '') =>
    api.get(`/v1/activities/search?q=${q}&location=${location}&category=${category}`),
  getPopularActivities: () => api.get('/v1/activities/popular-activities'),
  getRecommendedPartners: () => api.get('/v1/activities/recommended-partners'),
  getProductDetails: (id: string) => api.get(`/v1/activities/product-details/${id}`),

  // 6. Partner Request APIs
  sendPartnerRequest: (receiver_id: string, activity_id?: string, message?: string) =>
    api.post('/v1/partner-request/send', { receiver_id, activity_id, message }),
  getPartnerRequests: (type: 'sent' | 'received' = 'received') =>
    api.get(`/v1/partner-request/list?type=${type}`),
  actionPartnerRequest: (request_id: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL') =>
    api.post('/v1/partner-request/action', { request_id, action }),

  // 7. Explore APIs
  getExplore: (page = 1, limit = 10) => api.get(`/v1/explore?page=${page}&limit=${limit}`),
  filterExplore: (filters: any) => api.post('/v1/explore/filter', filters),

  // 8. General APIs
  getHelpSupport: () => api.get('/v1/general/help-support'),
  submitHelpTicket: (subject: string, message: string) =>
    api.post('/v1/general/help-support', { subject, message }),
  getTermsConditions: () => api.get('/v1/general/terms-and-conditions'),
  getChat: (conversation_id?: string) =>
    api.get(`/v1/general/chat${conversation_id ? `?conversation_id=${conversation_id}` : ''}`),
  getCallLogs: () => api.get('/v1/general/call'),
  initiateCall: (receiver_id: string, call_type = 'VIDEO') =>
    api.post('/v1/general/call', { receiver_id, call_type }),
};

export default api;
