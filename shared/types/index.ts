export interface User {
  id: string;
  email: string;
  userType: 'farmer' | 'carrier';
  profile: FarmerProfile | CarrierProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmerProfile {
  farmName: string;
  farmSize: number;
  farmLocation: string;
  primaryCrops: string[];
  contactPhone: string;
  rating: number;
  totalJobs: number;
}

export interface CarrierProfile {
  companyName: string;
  vehicleType: string;
  vehicleCapacity: number;
  serviceAreas: string[];
  contactPhone: string;
  rating: number;
  totalDeliveries: number;
  equipmentTypes: string[];
}

export interface Job {
  id: string;
  farmerId: string;
  farmer: User;
  title: string;
  description: string;
  cropType: string;
  quantity: number;
  unit: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: Date;
  deliveryDate: Date;
  budget: number;
  equipmentRequired: string[];
  specialInstructions?: string;
  status: 'open' | 'bidding' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  jobId: string;
  carrierId: string;
  carrier: User;
  bidAmount: number;
  estimatedDuration: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: 'farmer' | 'carrier';
  profile: FarmerProfile | CarrierProfile;
}