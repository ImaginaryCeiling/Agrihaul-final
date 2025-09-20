import { ApiResponse, RegisterRequest, LoginRequest, User, AuthTokens } from '../../shared/types';

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

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

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
  async register(userData: RegisterRequest): Promise<{ user: Partial<User>; token: string }> {
    const response = await apiRequest<{ user: Partial<User>; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }

    throw new ApiError(response.error || 'Registration failed');
  },

  async login(credentials: LoginRequest): Promise<{ user: Partial<User>; token: string }> {
    const response = await apiRequest<{ user: Partial<User>; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }

    throw new ApiError(response.error || 'Login failed');
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser(): Partial<User> | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
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
  }
};

export { ApiError };