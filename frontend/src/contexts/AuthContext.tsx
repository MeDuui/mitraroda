import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const savedUser = await SecureStore.getItemAsync('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = response.data;
    
    await SecureStore.setItemAsync('auth_token', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    router.replace('/(tabs)');
  };

  const loginWithUsername = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const { user: userData, token: newToken } = response.data;
    
    await SecureStore.setItemAsync('auth_token', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    router.replace('/(tabs)');
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    const { user: userData, token: newToken } = response.data;
    
    await SecureStore.setItemAsync('auth_token', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    router.replace('/(tabs)');
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user');
    
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithUsername, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}