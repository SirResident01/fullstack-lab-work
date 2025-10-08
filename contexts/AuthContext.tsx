import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, LoginResponse, AuthContextType } from '@/types/auth';
import { apiClient } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем сохраненный токен при загрузке
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Проверяем валидность токена
      checkAuth(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = async (authToken: string) => {
    try {
      console.log('🔍 checkAuth called with token:', authToken.substring(0, 20) + '...');
      // Устанавливаем токен в API клиенте
      apiClient.setAuthToken(authToken);
      
      const userData = await apiClient.getCurrentUser(authToken);
      console.log('🔍 User data received:', userData);
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await apiClient.login(username, password);
      
      if (response.access_token) {
        setToken(response.access_token);
        localStorage.setItem('auth_token', response.access_token);
        
        // Устанавливаем токен в API клиенте для всех последующих запросов
        apiClient.setAuthToken(response.access_token);
        
        // Получаем информацию о пользователе
        const userData = await apiClient.getCurrentUser(response.access_token);
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Проверяем, что пароли совпадают
      if (password !== confirmPassword) {
        return false;
      }
      
      const userData = await apiClient.register(username, password, confirmPassword);
      
      if (userData) {
        // После успешной регистрации автоматически входим в систему
        return await login(username, password);
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerAdmin = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Проверяем, что пароли совпадают
      if (password !== confirmPassword) {
        return false;
      }
      
      const userData = await apiClient.registerAdmin(username, password, confirmPassword);
      
      if (userData) {
        // После успешной регистрации автоматически входим в систему
        return await login(username, password);
      }
      return false;
    } catch (error) {
      console.error('Admin registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    // Очищаем токен из API клиента
    apiClient.clearAuthToken();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    registerAdmin,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
  };
  
  // Отладочная информация
  console.log('🔍 AuthContext Debug:', {
    user,
    token: token ? token.substring(0, 20) + '...' : null,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    userRole: user?.role
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

