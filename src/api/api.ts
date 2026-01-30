import axios from 'axios';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const cleanUrl = url.replace(/\/$/, ''); // Remove trailing slash
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  forgotPassword: (phoneNumber: string) => api.post('/auth/forgot-password', { phoneNumber }),
  verifyOtp: (phoneNumber: string, otp: string) => api.post('/auth/verify-otp', { phoneNumber, otp }),
  resetPassword: (resetToken: string, newPassword: any) => api.post('/auth/reset-password', { resetToken, newPassword }),
};

export const partiesApi = {
  getAll: () => api.get('/parties'),
  create: (data: any) => api.post('/parties', data),
  update: (id: string, data: any) => api.put(`/parties/${id}`, data),
  delete: (id: string) => api.delete(`/parties/${id}`),
};

export const chequesApi = {
  getAll: () => api.get('/cheques'),
  create: (data: any) => api.post('/cheques', data),
  update: (id: string, data: any) => api.put(`/cheques/${id}`, data),
  delete: (id: string) => api.delete(`/cheques/${id}`),
  getStats: () => api.get('/cheques/stats'),
  getReminders: () => api.get('/cheques/reminders'),
};

export const adminApi = {
  triggerBackup: () => api.post('/admin/backup'),
};

export default api;
