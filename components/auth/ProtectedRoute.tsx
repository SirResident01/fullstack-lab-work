import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardBody } from '@/components/ui/Card';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  fallback 
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Доступ запрещен
            </h3>
            <p className="text-gray-600 mb-4">
              Для доступа к этой странице необходимо войти в систему
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Войти в систему
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardBody className="text-center py-12">
            <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Недостаточно прав
            </h3>
            <p className="text-gray-600 mb-4">
              Для доступа к этой странице требуются права администратора
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              На главную
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

