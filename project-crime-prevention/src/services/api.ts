import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate instance for health checks (root level endpoint)
export const healthApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyticsAPI = {
  getMapData: () => api.get('/analytics/descriptive/map-data'),
  getCrimeTypeDistribution: (filters?: { barangay?: string; municipality?: string; province?: string }) => {
    const params = new URLSearchParams();
    if (filters?.barangay) params.append('barangay', filters.barangay);
    if (filters?.municipality) params.append('municipality', filters.municipality);
    if (filters?.province) params.append('province', filters.province);
    return api.get(`/analytics/descriptive/types/distribution?${params.toString()}`);
  },
};

export const crimesAPI = {
  getCrimes: (filters?: { barangay?: string; municipality?: string; province?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.barangay) params.append('barangay', filters.barangay);
    if (filters?.municipality) params.append('municipality', filters.municipality);
    if (filters?.province) params.append('province', filters.province);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    return api.get(`/crimes?${params.toString()}`);
  },
};

export const healthAPI = {
  checkHealth: () => healthApi.get('/health'),
};

export const predictiveAPI = {
  getModelPerformance: () => api.get('/predict/model/performance'),
};
