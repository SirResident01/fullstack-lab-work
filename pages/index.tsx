import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Иконки заменены на эмодзи для упрощения
import { apiClient } from '@/lib/api';
import { CarStatistics, OwnerStatistics } from '@/types/api';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UserMenu from '@/components/auth/UserMenu';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function HomePage() {
  const { isAuthenticated, user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  
  useDataRefresh();
  useAutoRefresh(60000); // Обновляем каждую минуту

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const { data: carStats, isLoading: carStatsLoading, error: carStatsError } = useQuery(
    'carStatistics',
    () => apiClient.getCarStatistics(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const { data: ownerStats, isLoading: ownerStatsLoading, error: ownerStatsError } = useQuery(
    'ownerStatistics',
    () => apiClient.getOwnerStatistics(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );


  const { data: status } = useQuery(
    'status',
    () => apiClient.getStatus(),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <>
      <Head>
        <title>Система управления автомобилями</title>
        <meta name="description" content="Современная система управления автомобилями и их владельцами" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <span className="text-2xl">🚗</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Система управления автомобилями
                  </h1>
                  <p className="text-sm text-gray-500">
                    {status?.app} v{status?.version}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status?.status === 'ok' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {status?.status === 'ok' ? 'Онлайн' : 'Офлайн'}
                </span>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/cars/simple">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Автомобили</h3>
                    <p className="text-sm text-gray-500">Управление автомобилями</p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/owners/simple">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Владельцы</h3>
                    <p className="text-sm text-gray-500">Управление владельцами</p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/cars/simple">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-2xl">➕</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Добавить</h3>
                    <p className="text-sm text-gray-500">Новый автомобиль</p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/search/simple">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Поиск</h3>
                    <p className="text-sm text-gray-500">Расширенный поиск</p>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/test-api">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <span className="text-2xl">🧪</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Тест API</h3>
                    <p className="text-sm text-gray-500">Тестирование API</p>
                  </div>
                </CardBody>
              </Card>
            </Link>

          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Car Statistics */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📊</span>
                  <h3 className="text-lg font-semibold text-gray-900">Статистика автомобилей</h3>
                </div>
              </CardHeader>
              <CardBody>
                {carStatsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : carStatsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">Ошибка загрузки статистики</div>
                    <div className="text-sm text-gray-500">{carStatsError instanceof Error ? carStatsError.message : String(carStatsError)}</div>
                  </div>
                ) : carStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{carStats.total_cars}</div>
                        <div className="text-sm text-blue-600">Всего автомобилей</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{carStats.total_owners}</div>
                        <div className="text-sm text-green-600">Владельцев</div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {new Intl.NumberFormat('ru-RU').format(Math.round(carStats.average_price))} ₸
                      </div>
                      <div className="text-sm text-yellow-600">Средняя цена</div>
                    </div>
                    {carStats.most_expensive && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Самый дорогой:</div>
                        <div className="text-sm text-gray-600">
                          {carStats.most_expensive.brand} {carStats.most_expensive.model} - 
                          {new Intl.NumberFormat('ru-RU').format(carStats.most_expensive.price)} ₸
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Нет данных для отображения
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Owner Statistics */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">👥</span>
                  <h3 className="text-lg font-semibold text-gray-900">Статистика владельцев</h3>
                </div>
              </CardHeader>
              <CardBody>
                {ownerStatsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : ownerStatsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">Ошибка загрузки статистики</div>
                    <div className="text-sm text-gray-500">{ownerStatsError instanceof Error ? ownerStatsError.message : String(ownerStatsError)}</div>
                  </div>
                ) : ownerStats && ownerStats.length > 0 ? (
                  <div className="space-y-3">
                    {ownerStats.slice(0, 5).map((owner) => (
                      <div key={owner.ownerid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {owner.firstname} {owner.lastname}
                          </div>
                          <div className="text-sm text-gray-500">ID: {owner.ownerid}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary-600">
                            {owner.car_count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {owner.car_count === 1 ? 'автомобиль' : 'автомобилей'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {ownerStats.length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        и еще {ownerStats.length - 5} владельцев...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Нет данных для отображения
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
