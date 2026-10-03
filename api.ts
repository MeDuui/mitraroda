import axios from 'axios';

// API_BASE_URL - Update this to your Railway deployment URL after deploying
const API_BASE_URL = 'https://mitraroda-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized - redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default api;

// API Endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  
  // Trips
  trips: '/trips',
  
  // Expenses
  expenses: '/expenses',
  
  // Targets
  targets: '/targets',
  
  // Summary
  summary: '/summary',
  
  // Export
  exportPdf: '/export/pdf',
};