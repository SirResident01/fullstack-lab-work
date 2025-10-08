import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import AdminRegisterForm from '@/components/auth/AdminRegisterForm';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <>
      <Head>
        <title>Вход в систему - Система управления автомобилями</title>
        <meta name="description" content="Вход в систему управления автомобилями" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="p-3 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🚗</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'login' ? 'Вход в систему' : 
               mode === 'register' ? 'Регистрация пользователя' : 
               'Регистрация администратора'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {mode === 'login' ? 'Войдите в систему для доступа к функциям управления' :
               mode === 'register' ? 'Зарегистрируйтесь как обычный пользователь' :
               'Создайте аккаунт администратора'}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {mode === 'login' && (
            <LoginForm 
              onSuccess={() => router.push('/')} 
              onSwitchToRegister={() => setMode('register')}
            />
          )}
          {mode === 'register' && (
            <RegisterForm 
              onSuccess={() => router.push('/')} 
              onSwitchToLogin={() => setMode('login')}
            />
          )}
          {mode === 'admin' && (
            <AdminRegisterForm 
              onSuccess={() => router.push('/')} 
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600 space-y-2">
            <p>Демонстрационная система с JWT аутентификацией</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setMode('login')}
                className={`px-3 py-1 rounded text-xs ${
                  mode === 'login' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setMode('register')}
                className={`px-3 py-1 rounded text-xs ${
                  mode === 'register' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Регистрация
              </button>
              <button
                onClick={() => setMode('admin')}
                className={`px-3 py-1 rounded text-xs ${
                  mode === 'admin' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Админ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

