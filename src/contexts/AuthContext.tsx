import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  startup?: string;
  city?: string;
  status?: 'pending' | 'approved';
  plan?: string;
  avatar?: string;
  permissions?: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, isAdmin?: boolean) => Promise<{ success: boolean, message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  startup: string;
  role: string;
  city: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@startup.com',
    startup: 'TechFlow',
    role: 'CEO',
    city: 'San Francisco',
    status: 'approved',
    plan: 'Premium',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@innovate.com',
    startup: 'InnovateAI',
    role: 'CTO',
    city: 'New York',
    status: 'approved',
    plan: 'Basic',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('bxtra-token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://bharatx-events.onrender.com/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ ...data.user, plan: data.user.plan || 'Free' });
        } else {
          localStorage.removeItem('bxtra-token');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: LoginCredentials, isAdmin = false): Promise<{ success: boolean, message?: string }> => {
    setIsLoading(true);
    
    try {
      const loginUrl = isAdmin
        ? 'https://bharatx-events.onrender.com/api/admin/login'
        : 'https://bharatx-events.onrender.com/api/auth/login';

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      const userData = data.admin || data.user;
      localStorage.setItem('bxtra-token', data.token);
      localStorage.setItem('bxtra-user', JSON.stringify(userData));
      // The backend already sends 'id', so no need to map from '_id'
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean, message?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://bharatx-events.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // Save token and user data
      localStorage.setItem('bxtra-token', data.token);
      localStorage.setItem('bxtra-user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bxtra-token');
    localStorage.removeItem('bxtra-user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};