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

export const login = async (credentials: LoginCredentials): Promise<AuthTokens> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error('Network error');
    }
    
    const data = await response.json();
    const { token, refreshToken, user } = data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('current_user', JSON.stringify(user));
    
    return { token, refreshToken };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    });
  } catch {
  } finally {
    clearTokens();
  }
};

export const verifyAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
    });
    
    if (!response.ok) {
    }
    
    return await response.json();
  } catch {
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


