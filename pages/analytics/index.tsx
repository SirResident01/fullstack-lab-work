import React from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/router';

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data: overview, isLoading: isLoadingOverview, error: errorOverview } = useQuery(
    'analyticsOverview',
    () => apiClient.getAnalyticsOverview(),
    { enabled: isAuthenticated }
  );

  const { data: carsByYear, isLoading: isLoadingCarsByYear, error: errorCarsByYear } = useQuery(
    'carsByYear',
    () => apiClient.getCarsByYear(),
    { enabled: isAuthenticated }
  );

  const { data: ownersStats, isLoading: isLoadingOwnersStats, error: errorOwnersStats } = useQuery(
    'ownersStats',
    () => apiClient.getOwnersStats(),
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return <LoadingSpinner />; // Show spinner while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Аналитика</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Аналитика системы</h1>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Обзор</h2>
          </CardHeader>
          <CardBody>
            {isLoadingOverview ? (
              <LoadingSpinner />
            ) : errorOverview ? (
              <div className="text-red-600">Ошибка: {errorOverview instanceof Error ? errorOverview.message : String(errorOverview)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md bg-blue-50">
                  <p className="text-sm text-gray-600">Всего владельцев</p>
                  <p className="text-2xl font-bold">{overview?.total_owners}</p>
                </div>
                <div className="p-4 border rounded-md bg-green-50">
                  <p className="text-sm text-gray-600">Всего автомобилей</p>
                  <p className="text-2xl font-bold">{overview?.total_cars}</p>
                </div>
                <div className="p-4 border rounded-md bg-purple-50">
                  <p className="text-sm text-gray-600">Всего пользователей</p>
                  <p className="text-2xl font-bold">{overview?.total_users}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Cars by Year */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Автомобили по году выпуска</h2>
          </CardHeader>
          <CardBody>
            {isLoadingCarsByYear ? (
              <LoadingSpinner />
            ) : errorCarsByYear ? (
              <div className="text-red-600">Ошибка: {errorCarsByYear instanceof Error ? errorCarsByYear.message : String(errorCarsByYear)}</div>
            ) : (
              <ul className="list-disc list-inside">
                {carsByYear?.map((item) => (
                  <li key={item.year}>{item.year}: {item.count} автомобилей</li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Owners Stats */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Статистика владельцев</h2>
          </CardHeader>
          <CardBody>
            {isLoadingOwnersStats ? (
              <LoadingSpinner />
            ) : errorOwnersStats ? (
              <div className="text-red-600">Ошибка: {errorOwnersStats instanceof Error ? errorOwnersStats.message : String(errorOwnersStats)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-yellow-50">
                  <p className="text-sm text-gray-600">Владельцы с наибольшим количеством автомобилей</p>
                  <ul className="list-disc list-inside">
                    {ownersStats?.map((owner) => (
                      <li key={owner.owner_id}>{owner.name} ({owner.car_count} авто)</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default AnalyticsPage;
