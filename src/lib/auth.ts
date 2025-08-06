import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
}

axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/refresh', {
            refreshToken
          });
          const { token } = response.data;
          localStorage.setItem('auth_token', token);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${token}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  try {
    const response = await axios.post('/auth/login', credentials);
    const { token, refreshToken } = response.data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    
    return { token, refreshToken };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Invalid credentials');
    }
    throw new Error('Network error');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post('/auth/logout');
  } catch (error) {
    // Ignore logout errors
  } finally {
    clearTokens();
  }
};

export const verifyAuth = async (): Promise<boolean> => {
  try {
    await axios.get('/auth/verify');
    return true;
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get('/auth/user');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

export const clearTokens = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
};

// Mock API responses for testing
if (process.env.NODE_ENV === 'development') {
  // Mock login endpoint
  const mockLogin = (credentials: LoginCredentials) => {
    // Mock user credentials for testing
    const mockUsers = [
      { username: 'admin', password: 'password123' },
      { username: 'user', password: 'userpass' },
      { username: 'test', password: 'test123' }
    ];
    
    const user = mockUsers.find(u => 
      u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      const userData = {
        id: '1',
        username: user.username,
        email: `${user.username}@example.com`
      };
      
      localStorage.setItem('current_user', JSON.stringify(userData));
      
      return {
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: userData
        }
      };
    } else {
      throw {
        response: { status: 401 },
        isAxiosError: true
      };
    }
  };
  
  // Mock verify endpoint
  const mockVerify = () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-jwt-token-')) {
      return { data: { valid: true } };
    } else {
      throw { response: { status: 401 } };
    }
  };
  
  // Mock user endpoint
  const mockUser = () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-jwt-token-')) {
      // Extract the original username from localStorage or from a stored user object
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        return { data: JSON.parse(storedUser) };
      }
      
      // Fallback to testuser if no stored user found
      return {
        data: {
          id: '1',
          username: 'testuser',
          email: 'testuser@example.com'
        }
      };
    } else {
      throw { response: { status: 401 } };
    }
  };
  
  // Override axios for mock endpoints
  const originalPost = axios.post;
  const originalGet = axios.get;
  
  axios.post = ((url: string, data?: any, config?: any) => {
    if (url === '/auth/login') {
      return Promise.resolve(mockLogin(data));
    }
    if (url === '/auth/logout') {
      return Promise.resolve({ data: { success: true } });
    }
    if (url === '/auth/refresh') {
      return Promise.resolve({
        data: { token: 'mock-jwt-token-refreshed-' + Date.now() }
      });
    }
    return originalPost(url, data, config);
  }) as any;
  
  axios.get = ((url: string, config?: any) => {
    if (url === '/auth/verify') {
      return Promise.resolve(mockVerify());
    }
    if (url === '/auth/user') {
      return Promise.resolve(mockUser());
    }
    return originalGet(url, config);
  }) as any;
}
