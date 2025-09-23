import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  startup: string;
  role: string;
  city: string;
  status: 'pending' | 'approved';
  plan: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('bxtra-token');
    const userData = localStorage.getItem('bxtra-user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock login - in real app, this would be an API call
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password') {
      const token = 'mock-jwt-token';
      localStorage.setItem('bxtra-token', token);
      localStorage.setItem('bxtra-user', JSON.stringify(foundUser));
      setUser(foundUser);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      status: 'pending',
      plan: 'Basic'
    };
    
    const token = 'mock-jwt-token';
    localStorage.setItem('bxtra-token', token);
    localStorage.setItem('bxtra-user', JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('bxtra-token');
    localStorage.removeItem('bxtra-user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};