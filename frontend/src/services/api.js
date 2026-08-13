import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ── Unified API Instance ───────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const res = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
        const storage = sessionStorage.getItem('refresh_token') ? sessionStorage : localStorage;
        storage.setItem('access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

// Backward compatibility exports
export const djangoAPI = api;
export const nodeAPI = api;

// ── Property Service ─────────────────────────────────────────────
export const propertyService = {
  getAll: (params) => api.get('/properties/', { params }),
  getById: (id) => api.get(`/properties/${id}/`),
  create: (data) => api.post('/properties/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/properties/${id}/update/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/properties/${id}/delete/`),
  archive: (id) => api.post(`/properties/${id}/archive/`),
  republish: (id) => api.post(`/properties/${id}/republish/`),
  getSellerProperties: (params) => api.get('/properties/seller/properties/', { params }),
  getSellerDashboard: () => api.get('/properties/seller/dashboard/'),
  getTrending: () => api.get('/properties/trending/'),
  getRecommendations: (params) => api.get('/properties/recommendations/', { params }),
  getNearby: (params) => api.get('/properties/nearby/', { params }),
};

// ── ML Service ───────────────────────────────────────────────────
export const mlService = {
  predictPrice: (data) => api.post('/ml/predict/price/', data),
  predictBuyer: (data) => api.post('/ml/predict/buyer/', data),
  getModelInfo: () => api.get('/ml/model/info/'),
  getHistory: () => api.get('/ml/history/'),
  getAdminStats: () => api.get('/ml/admin/stats/'),
};

// ── Auth Service ─────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (data) => api.post('/auth/logout/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  uploadPhoto: (data) => api.post('/auth/profile/photo/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.post('/auth/change-password/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  verifyEmail: (data) => api.post('/auth/verify-email/', data),
  resendOTP: (data) => api.post('/auth/resend-otp/', data),
  adminGetUsers: (params) => api.get('/auth/admin/users/', { params }),
  adminDeleteUser: (userId) => api.delete(`/auth/admin/users/${userId}/`),
};

// ── Inquiry Service ──────────────────────────────────────────────
export const inquiryService = {
  create: (data) => api.post('/inquiries/', data),
  getBuyerInquiries: (params) => api.get('/inquiries/buyer', { params }),
  getSellerInquiries: (params) => api.get('/inquiries/seller', { params }),
  getAllInquiries: (params) => api.get('/inquiries/admin', { params }),
  updateStatus: (id, data) => api.patch(`/inquiries/${id}/status`, data),
  cancel: (id) => api.patch(`/inquiries/${id}/cancel`),
  getById: (id) => api.get(`/inquiries/${id}`),
  getUnread: () => api.get('/inquiries/seller/unread'),
};

// ── Wishlist Service ─────────────────────────────────────────────
export const wishlistService = {
  get: () => api.get('/wishlist/'),
  add: (data) => api.post('/wishlist/', data),
  remove: (propertyId) => api.delete(`/wishlist/${propertyId}`),
  updateNote: (propertyId, note) => api.patch(`/wishlist/${propertyId}/note`, { note }),
  check: (propertyId) => api.get(`/wishlist/check/${propertyId}`),
  clear: () => api.delete('/wishlist/clear'),
};

// ── Notification Service ─────────────────────────────────────────
export const notificationService = {
  get: (params) => api.get('/notifications/', { params }),
  getUnread: () => api.get('/notifications/unread'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ── Search Service ───────────────────────────────────────────────
export const searchService = {
  searchCities: (q) => api.get('/search/cities', { params: { q } }),
  getSuggestions: (q) => api.get('/search/suggestions', { params: { q } }),
  getTopCities: () => api.get('/search/top-cities'),
  getWishlistTrends: () => api.get('/search/wishlist-trends'),
};

// ── City Service ─────────────────────────────────────────────────
export const cityService = {
  getAll: () => api.get('/cities/'),
  seed: () => api.get('/cities/seed'),
};
