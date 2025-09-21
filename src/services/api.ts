import { ApiResponse, RegisterRequest, LoginRequest, User, AuthTokens, RatingRequest, Rating, RatingSummary } from '../../shared/types';

const API_BASE_URL = '';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

export const authService = {
  async register(userData: RegisterRequest): Promise<{ user: Partial<User> }> {
    // Simulate API call for demo - just store user data locally
    const mockUser: Partial<User> = {
      id: Date.now().toString(),
      email: userData.email,
      userType: userData.userType,
      profile: userData.profile
    };

    // Store user in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(mockUser));

    return { user: mockUser };
  },

  async login(credentials: LoginRequest): Promise<{ user: Partial<User> }> {
    // Simulate API call for demo - accept any credentials
    const mockUser: Partial<User> = {
      id: Date.now().toString(),
      email: credentials.email,
      userType: 'farmer', // Default for demo
      profile: {
        farmName: 'Demo Farm',
        farmSize: 100,
        farmLocation: 'Demo Location',
        primaryCrops: ['corn'],
        contactPhone: '555-0123',
        rating: 0,
        totalJobs: 0
      }
    };

    // Store user in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(mockUser));

    return { user: mockUser };
  },

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  },

  getCurrentUser(): Partial<User> | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
};

export const jobService = {
  async getJobs(params?: {
    status?: string;
    cropType?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await apiRequest(endpoint);
  },

  async createJob(jobData: any) {
    return await apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async updateJobStatus(jobId: string, status: string, carrierId?: string) {
    return await apiRequest(`/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, carrierId }),
    });
  },

  async getJobById(jobId: string) {
    return await apiRequest(`/api/jobs/${jobId}`);
  }
};

export const userService = {
  async getProfile() {
    return await apiRequest('/api/users/profile');
  }
};

export const bidService = {
  async createBid(bidData: {
    jobId: string;
    bidAmount: number;
    estimatedDuration?: number;
    message?: string;
  }) {
    return await apiRequest('/api/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  },

  async acceptBid(bidId: string) {
    return await apiRequest(`/api/bids/${bidId}/accept`, {
      method: 'POST',
    });
  },

  async getBids(jobId?: string) {
    const endpoint = jobId ? `/api/bids?jobId=${jobId}` : '/api/bids';
    return await apiRequest(endpoint);
  }
};

export const activeJobService = {
  async getActiveJobs(userId?: string) {
    const endpoint = userId ? `/api/active-jobs?userId=${userId}` : '/api/active-jobs';
    return await apiRequest(endpoint);
  },

  async updateJobStatus(jobId: string, status: string) {
    return await apiRequest(`/api/active-jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
};

export const ratingService = {
  async submitRating(ratingData: RatingRequest) {
    return await apiRequest('/api/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  async getUserRatings(userId: string) {
    return await apiRequest<Rating[]>(`/api/ratings/user/${userId}`);
  },

  async getJobRatings(jobId: string) {
    return await apiRequest<Rating[]>(`/api/ratings/job/${jobId}`);
  },

  async getRatingSummary(userId: string) {
    return await apiRequest<RatingSummary>(`/api/ratings/summary/${userId}`);
  },

  async updateRating(ratingId: string, updates: Partial<RatingRequest>) {
    return await apiRequest(`/api/ratings/${ratingId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteRating(ratingId: string) {
    return await apiRequest(`/api/ratings/${ratingId}`, {
      method: 'DELETE',
    });
  }
};

export { ApiError };