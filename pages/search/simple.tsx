import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { CarWithOwner, CarQuery } from '@/types/api';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SimpleSearchPage() {
  const [searchQuery, setSearchQuery] = useState<CarQuery>({
    limit: 50,
    offset: 0,
    sort_by: 'id',
    sort_order: 'asc',
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch search results
  const { data: cars = [], isLoading: carsLoading, error: carsError } = useQuery(
    ['search', searchQuery],
    () => apiClient.searchCars(searchQuery),
    {
      enabled: hasSearched,
      keepPreviousData: true,
    }
  );

  const handleSearch = (query: CarQuery) => {
    setSearchQuery(query);
    setHasSearched(true);
  };

  const handleReset = () => {
    setHasSearched(false);
    setSearchQuery({
      limit: 50,
      offset: 0,
      sort_by: 'id',
      sort_order: 'asc',
    });
  };

  return (
    <>
      <Head>
        <title>Поиск - Система управления</title>
        <meta name="description" content="Расширенный поиск автомобилей" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span>← Назад</span>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Расширенный поиск</h1>
                  <p className="text-sm text-gray-500">
                    Поиск автомобилей по различным критериям
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Filters */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🔍</span>
                  <h3 className="text-lg font-medium text-gray-900">Поиск и фильтры</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Марка
                    </label>
                    <input
                      type="text"
                      placeholder="Например: Toyota"
                      value={searchQuery.brand || ''}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, brand: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цвет
                    </label>
                    <input
                      type="text"
                      placeholder="Например: Красный"
                      value={searchQuery.color || ''}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, color: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Год выпуска
                    </label>
                    <input
                      type="number"
                      placeholder="Например: 2023"
                      value={searchQuery.modelYear || ''}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, modelYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Минимальная цена
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={searchQuery.minPrice || ''}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, minPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Максимальная цена
                    </label>
                    <input
                      type="number"
                      placeholder="1000000"
                      value={searchQuery.maxPrice || ''}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, maxPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Сортировка
                    </label>
                    <select
                      value={searchQuery.sort_by}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, sort_by: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="id">ID</option>
                      <option value="brand">Марка</option>
                      <option value="model">Модель</option>
                      <option value="price">Цена</option>
                      <option value="modelYear">Год</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSearch(searchQuery)}
                    loading={carsLoading}
                    className="flex items-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Найти</span>
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🔍</span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Результаты поиска
                  </h2>
                  {cars.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {cars.length} {cars.length === 1 ? 'найден' : 'найдено'}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Новый поиск
                </Button>
              </div>

              {/* Results */}
              {carsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : carsError ? (
                <Card>
                  <CardBody className="text-center py-12">
                    <div className="text-red-600 mb-4">
                      Ошибка поиска
                    </div>
                    <Button onClick={() => window.location.reload()}>
                      Попробовать снова
                    </Button>
                  </CardBody>
                </Card>
              ) : cars.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-12">
                    <span className="text-6xl mb-4">🔍</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ничего не найдено
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Попробуйте изменить параметры поиска
                    </p>
                    <Button onClick={handleReset}>
                      Новый поиск
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <Card key={car.id} className="hover:shadow-md transition-shadow">
                      <CardBody>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                              <span className="text-2xl">🚗</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {car.brand} {car.model}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {car.registrationNumber}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {car.color}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Год:</span>
                            <span className="text-sm font-medium">{car.modelYear}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Цена:</span>
                            <span className="text-sm font-semibold text-primary-600">
                              {formatPrice(car.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Владелец:</span>
                            <span className="text-sm font-medium">
                              {car.owner || 'Не назначен'}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Link href={`/cars/simple`}>
                            <Button variant="outline" size="sm">
                              Подробнее
                            </Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🔍</span>
                    <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">
                    Используйте различные фильтры для точного поиска автомобилей по марке, 
                    цвету, году выпуска и цене.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📊</span>
                    <h3 className="text-lg font-semibold text-gray-900">Сортировка</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">
                    Сортируйте результаты по различным критериям: ID, марка, модель, 
                    цена или год выпуска.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🔍</span>
                    <h3 className="text-lg font-semibold text-gray-900">Поиск</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600">
                    Начните поиск, заполнив нужные поля и нажав кнопку "Найти". 
                    Результаты появятся ниже.
                  </p>
                </CardBody>
              </Card>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
