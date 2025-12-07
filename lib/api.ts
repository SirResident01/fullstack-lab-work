import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  CarCreate,
  CarUpdate,
  CarResponse,
  CarWithOwner,
  CarQuery,
  OwnerCreate,
  OwnerUpdate,
  OwnerResponse,
  OwnerQuery,
  StatusResponse,
  MessageResponse,
  CarStatistics,
  OwnerStatistics,
  UserResponse,
} from '@/types/api';
import { User, LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ==================== BASIC ENDPOINTS ====================

  async getHello(): Promise<string> {
    const response = await this.client.get('/hello');
    return response.data;
  }

  async getStatus(): Promise<StatusResponse> {
    const response = await this.client.get('/api/status');
    return response.data;
  }

  // ==================== CAR ENDPOINTS ====================

  async getCars(skip: number = 0, limit: number = 100): Promise<CarWithOwner[]> {
    const response = await this.client.get('/cars', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getCar(id: number): Promise<CarWithOwner> {
    const response = await this.client.get(`/cars/${id}`);
    return response.data;
  }

  async createCar(car: CarCreate): Promise<CarResponse> {
    const response = await this.client.post('/cars', car);
    return response.data;
  }

  async updateCar(id: number, car: CarUpdate): Promise<CarResponse> {
    const response = await this.client.put(`/cars/${id}`, car);
    return response.data;
  }

  async deleteCar(id: number): Promise<MessageResponse> {
    const response = await this.client.delete(`/cars/${id}`);
    return response.data;
  }

  async getCarStatistics(): Promise<CarStatistics> {
    const response = await this.client.get('/cars/statistics');
    return response.data;
  }

  // ==================== CAR SEARCH ENDPOINTS ====================

  async searchCarsByBrand(brand: string): Promise<CarWithOwner[]> {
    const response = await this.client.get(`/cars/search/brand/${encodeURIComponent(brand)}`);
    return response.data;
  }

  async searchCarsByColor(color: string): Promise<CarWithOwner[]> {
    const response = await this.client.get(`/cars/search/color/${encodeURIComponent(color)}`);
    return response.data;
  }

  async searchCarsByYear(year: number): Promise<CarWithOwner[]> {
    const response = await this.client.get(`/cars/search/year/${year}`);
    return response.data;
  }

  async searchCarsByPriceRange(minPrice: number, maxPrice: number): Promise<CarWithOwner[]> {
    const response = await this.client.get('/cars/search/price-range', {
      params: { min_price: minPrice, max_price: maxPrice },
    });
    return response.data;
  }

  async searchCarsByOwner(ownerId: number): Promise<CarWithOwner[]> {
    const response = await this.client.get(`/cars/search/owner/${ownerId}`);
    return response.data;
  }

  async searchCars(query: CarQuery): Promise<CarWithOwner[]> {
    const response = await this.client.post('/cars/search', query);
    return response.data;
  }

  // ==================== OWNER ENDPOINTS ====================

  async getOwners(skip: number = 0, limit: number = 100): Promise<OwnerResponse[]> {
    const response = await this.client.get('/owners', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getOwner(id: number): Promise<OwnerResponse> {
    const response = await this.client.get(`/owners/${id}`);
    return response.data;
  }

  async createOwner(owner: OwnerCreate): Promise<OwnerResponse> {
    const response = await this.client.post('/owners', owner);
    return response.data;
  }

  async updateOwner(id: number, owner: OwnerUpdate): Promise<OwnerResponse> {
    const response = await this.client.put(`/owners/${id}`, owner);
    return response.data;
  }

  async deleteOwner(id: number): Promise<MessageResponse> {
    const response = await this.client.delete(`/owners/${id}`);
    return response.data;
  }

  async getOwnerStatistics(): Promise<OwnerStatistics[]> {
    const response = await this.client.get('/owners/statistics');
    return response.data;
  }

  // ==================== OWNER SEARCH ENDPOINTS ====================

  async searchOwnersByTerm(searchTerm: string): Promise<OwnerResponse[]> {
    const response = await this.client.get(`/owners/search/${encodeURIComponent(searchTerm)}`);
    return response.data;
  }

  async searchOwners(query: OwnerQuery): Promise<OwnerResponse[]> {
    const response = await this.client.post('/owners/search', query);
    return response.data;
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post('/login', { username, password });
    return response.data;
  }

  async register(username: string, password: string, confirmPassword: string): Promise<User> {
    const response = await this.client.post('/register', { 
      username, 
      password, 
      confirm_password: confirmPassword 
    });
    return response.data;
  }

  async registerAdmin(username: string, password: string, confirmPassword: string): Promise<User> {
    const response = await this.client.post('/register/admin', { 
      username, 
      password, 
      confirm_password: confirmPassword 
    });
    return response.data;
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await this.client.get('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  // Helper method to set auth token for all requests
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Helper method to clear auth token
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // ==================== USER MANAGEMENT ENDPOINTS ====================

  async getAllUsers(skip: number = 0, limit: number = 100): Promise<UserResponse[]> {
    const response = await this.client.get('/admin/users', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getUserById(userId: number): Promise<UserResponse> {
    const response = await this.client.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: number, userData: any): Promise<UserResponse> {
    const response = await this.client.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<MessageResponse> {
    const response = await this.client.delete(`/admin/users/${userId}`);
    return response.data;
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  async getAnalyticsOverview(): Promise<any> {
    const response = await this.client.get('/analytics/overview');
    return response.data;
  }

  async getCarsByYear(): Promise<any[]> {
    const response = await this.client.get('/analytics/cars-by-year');
    return response.data;
  }

  async getOwnersStats(): Promise<any[]> {
    const response = await this.client.get('/analytics/owners-stats');
    return response.data;
  }

  // ==================== SYSTEM SETTINGS ENDPOINTS ====================

  async getSystemSettings(): Promise<any> {
    const response = await this.client.get('/settings');
    return response.data;
  }

  async updateSystemSettings(settings: any): Promise<any> {
    const response = await this.client.put('/settings', settings);
    return response.data;
  }

  async createSystemBackup(): Promise<any> {
    const response = await this.client.get('/settings/backup');
    return response.data;
  }

  async getSystemLogs(limit = 100): Promise<any> {
    const response = await this.client.get('/settings/logs', {
      params: { limit },
    });
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
