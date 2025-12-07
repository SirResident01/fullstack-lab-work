// ==================== CAR TYPES ====================

export interface CarBase {
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  modelYear: number;
  price: number;
  owner_id: number;
}

export interface CarCreate extends CarBase {}

export interface CarUpdate {
  brand?: string;
  model?: string;
  color?: string;
  registrationNumber?: string;
  modelYear?: number;
  price?: number;
  owner_id?: number;
}

export interface CarResponse extends CarBase {
  id: number;
}

export interface CarForOwner {
  id: number;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  modelYear: number;
  price: number;
  owner_id: number;
}

export interface CarWithOwner {
  id: number;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  modelYear: number;
  price: number;
  owner_id: number;
  owner?: string;
  owner_firstname?: string;
  owner_lastname?: string;
}

// ==================== OWNER TYPES ====================

export interface OwnerBase {
  firstname: string;
  lastname: string;
}

export interface OwnerCreate extends OwnerBase {}

export interface OwnerUpdate {
  firstname?: string;
  lastname?: string;
}

export interface OwnerResponse extends OwnerBase {
  ownerid: number;
  cars: CarForOwner[];
}

// ==================== QUERY TYPES ====================

export interface CarQuery {
  brand?: string;
  color?: string;
  modelYear?: number;
  minPrice?: number;
  maxPrice?: number;
  owner_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface OwnerQuery {
  firstname?: string;
  lastname?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ==================== RESPONSE TYPES ====================

export interface StatusResponse {
  status: string;
  app: string;
  version: string;
  timestamp: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface CarStatistics {
  total_cars: number;
  total_owners: number;
  average_price: number;
  most_expensive: {
    id: number;
    brand: string;
    model: string;
    price: number;
  };
  cheapest: {
    id: number;
    brand: string;
    model: string;
    price: number;
  };
}

export interface OwnerStatistics {
  ownerid: number;
  firstname: string;
  lastname: string;
  car_count: number;
}

// ==================== USER TYPES ====================

export interface UserResponse {
  id: number;
  username: string;
  role: string;
}

// ==================== API ERROR TYPES ====================

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
}
