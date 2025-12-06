import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // ===== Authentication =====

  async register(email, password) {
    const response = await api.post('/auth/register', { email, password });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async logoutAll() {
    try {
      await api.post('/auth/logout/all');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    return response.data;
  },

  // ===== User Management =====

  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/users/me');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },

  async getSettings() {
    const response = await api.get('/users/me/settings');
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.patch('/users/me/settings', settings);
    return response.data;
  },

  async getAlerts() {
    const response = await api.get('/users/me/alerts');
    return response.data;
  },

  async markAlertAsRead(alertId) {
    const response = await api.patch(`/users/me/alerts/${alertId}/read`);
    return response.data;
  },

  // ===== Plan Management =====

  async deletePlan(planId) {
    const response = await api.delete(`/users/plan/${planId}`);
    return response.data;
  },

  async createPlan(planData) {
    const response = await api.post('/users/plan', planData);
    return response.data;
  },

  async updatePlan(planId, planData) {
    const response = await api.put(`/users/plan/${planId}`, planData);
    return response.data;
  },

  async getPlans() {
    const response = await api.get('/users/plan');
    return response.data;
  },

  // ===== Weather Forecast =====

  async getForecast(lat, lon) {
    const response = await api.get('/forecast', {
      params: { lat, lon },
    });
    return response.data;
  },

  // ===== Utility =====

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export default apiService;
