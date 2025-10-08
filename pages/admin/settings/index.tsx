import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/router';

const SystemSettingsPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [appName, setAppName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/'); // Redirect to home or a forbidden page
    }
  }, [isAuthenticated, isAdmin, router]);

  const { data: settings, isLoading, error } = useQuery(
    'systemSettings',
    () => apiClient.getSystemSettings(),
    {
      enabled: isAdmin, // Only fetch if admin
      onSuccess: (data) => {
        setAppName(data.system_name || '');
        setAdminEmail(data.admin_email || '');
        setMaintenanceMode(data.maintenance_mode || false);
      },
      onError: (err) => {
        console.error('Ошибка загрузки настроек системы:', err);
        if (err.message.includes('403')) {
          alert('У вас нет прав для просмотра настроек системы.');
          router.push('/');
        }
      }
    }
  );

  const updateSettingsMutation = useMutation(
    (updatedSettings: any) => apiClient.updateSystemSettings(updatedSettings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('systemSettings');
        alert('Настройки успешно обновлены!');
      },
      onError: (err: any) => {
        console.error('Ошибка обновления настроек системы:', err);
        if (err.response?.status === 403) {
          alert('У вас нет прав для изменения настроек системы.');
        } else {
          alert('Произошла ошибка при обновлении настроек.');
        }
      },
    }
  );

  const { data: health, isLoading: isLoadingHealth, error: errorHealth } = useQuery(
    'systemHealth',
    () => apiClient.createSystemBackup(),
    { enabled: isAdmin }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({ 
      system_name: appName, 
      admin_email: adminEmail, 
      maintenance_mode: maintenanceMode 
    });
  };

  if (!isAuthenticated || !isAdmin) {
    return <LoadingSpinner />; // Show spinner while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Настройки системы</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Настройки системы</h1>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-600">Ошибка: {error.message}</div>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Основные настройки</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-700">Название приложения</label>
                  <input
                    type="text"
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">Email администратора</label>
                  <input
                    type="email"
                    id="adminEmail"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">Режим обслуживания</label>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateSettingsMutation.isLoading}>
                    {updateSettingsMutation.isLoading ? <LoadingSpinner /> : 'Сохранить изменения'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* System Health */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Состояние системы</h2>
          </CardHeader>
          <CardBody>
            {isLoadingHealth ? (
              <LoadingSpinner />
            ) : errorHealth ? (
              <div className="text-red-600">Ошибка: {errorHealth.message}</div>
            ) : (
              <p className="text-gray-700">Статус: {health?.message}</p>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default SystemSettingsPage;
