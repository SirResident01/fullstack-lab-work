import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect } from 'react';

export default function AdminPanel() {
  const { isAuthenticated, user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <>
      <Head>
        <title>Админ панель - Система управления автомобилями</title>
        <meta name="description" content="Панель администратора системы управления автомобилями" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Админ панель
                  </h1>
                  <p className="text-sm text-gray-500">
                    Управление системой
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    ← На главную
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management */}
            <Link href="/admin/users">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2">Управление пользователями</h3>
                  <p className="text-gray-600 text-sm">Создание и управление пользователями</p>
                </CardBody>
              </Card>
            </Link>

            {/* System Settings */}
            <Link href="/admin/settings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-lg font-semibold mb-2">Настройки системы</h3>
                  <p className="text-gray-600 text-sm">Конфигурация и параметры</p>
                </CardBody>
              </Card>
            </Link>

            {/* Analytics */}
            <Link href="/analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="p-6 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2">Аналитика</h3>
                  <p className="text-gray-600 text-sm">Статистика и отчеты</p>
                </CardBody>
              </Card>
            </Link>
          </div>

          {/* Admin Info */}
          <div className="mt-8">
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о системе</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700">Текущий пользователь</div>
                    <div className="text-lg font-semibold text-blue-900">{user?.username}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-700">Роль</div>
                    <div className="text-lg font-semibold text-green-900">{user?.role}</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}